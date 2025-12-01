import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
import json
import logging
from typing import List, Dict, Any, Tuple

from backend.api.ml_model import RecipeMLModel

logger = logging.getLogger(__name__)

class RecipeModelEvaluator:
    def __init__(self, ml_model):
        self.ml_model = ml_model
        self.y_true = []
        self.y_pred = []
        self.recipe_names = []
        
    def prepare_evaluation_data(self):
        """Prepare data for model evaluation"""
        try:
            recipes = self.ml_model.fetch_recipes_from_db()
            
            if len(recipes) < 10:
                logger.warning("Not enough recipes for proper evaluation. Need at least 10 recipes.")
                return False
            
            X = []
            y_true = []
            recipe_info = []
            
            for recipe in recipes:
                ingredients = self.ml_model.parse_ingredients(
                    recipe['ingredients'], 
                    recipe.get('structured_ingredients')
                )
                if not ingredients:
                    continue
                    
                features = self.ml_model.prepare_features(
                    user_ingredients=ingredients,
                    cuisine_type=recipe.get('cuisine', 'indian'),
                    meal_type=recipe.get('meal_type', 'dinner'),
                    diet_type=recipe.get('diet_type', 'vegetarian'),
                    serving_size=recipe.get('serving_size', 4)
                )
                
                X.append(list(features.values()))
                y_true.append(recipe['title'])
                recipe_info.append({
                    'title': recipe['title'],
                    'ingredients': ingredients,
                    'features': list(features.values())
                })
            
            if len(set(y_true)) < 5:
                logger.warning("Not enough recipe variety for evaluation.")
                return False
            
            self.X = np.array(X)
            self.y_true = y_true
            self.recipe_info = recipe_info
            self.feature_columns = list(features.keys())
            
            logger.info(f"Prepared evaluation data: {len(X)} samples, {len(set(y_true))} unique recipes")
            return True
            
        except Exception as e:
            logger.error(f"Error preparing evaluation data: {e}")
            return False
    
    def train_test_split_evaluation(self, test_size=0.3, random_state=42):
        """Perform train-test split and evaluate model performance"""
        if not hasattr(self, 'X') or not hasattr(self, 'y_true'):
            if not self.prepare_evaluation_data():
                return None
        
        try:
            # Encode labels
            label_encoder = LabelEncoder()
            y_encoded = label_encoder.fit_transform(self.y_true)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                self.X, y_encoded, test_size=test_size, random_state=random_state, stratify=y_encoded
            )
            
            # Scale features
            from sklearn.preprocessing import StandardScaler
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train model
            model = RandomForestClassifier(
                n_estimators=50,
                max_depth=10,
                min_samples_split=2,
                min_samples_leaf=1,
                random_state=42
            )
            
            model.fit(X_train_scaled, y_train)
            
            # Predictions
            y_pred = model.predict(X_test_scaled)
            y_pred_proba = model.predict_proba(X_test_scaled)
            
            # Convert back to recipe names
            y_true_names = label_encoder.inverse_transform(y_test)
            y_pred_names = label_encoder.inverse_transform(y_pred)
            
            # Store results
            self.y_true_eval = y_true_names
            self.y_pred_eval = y_pred_names
            self.label_encoder = label_encoder
            self.unique_recipes = label_encoder.classes_
            
            # Calculate metrics
            results = self.calculate_comprehensive_metrics(y_true_names, y_pred_names, y_pred_proba, label_encoder)
            
            return results
            
        except Exception as e:
            logger.error(f"Error in train-test evaluation: {e}")
            return None
    
    def calculate_comprehensive_metrics(self, y_true, y_pred, y_pred_proba=None, label_encoder=None):
        """Calculate comprehensive evaluation metrics"""
        try:
            metrics = {}
            
            # Basic metrics
            metrics['accuracy'] = accuracy_score(y_true, y_pred)
            metrics['precision_macro'] = precision_score(y_true, y_pred, average='macro', zero_division=0)
            metrics['precision_weighted'] = precision_score(y_true, y_pred, average='weighted', zero_division=0)
            metrics['recall_macro'] = recall_score(y_true, y_pred, average='macro', zero_division=0)
            metrics['recall_weighted'] = recall_score(y_true, y_pred, average='weighted', zero_division=0)
            metrics['f1_macro'] = f1_score(y_true, y_pred, average='macro', zero_division=0)
            metrics['f1_weighted'] = f1_score(y_true, y_pred, average='weighted', zero_division=0)
            
            # Confusion matrix
            cm = confusion_matrix(y_true, y_pred)
            metrics['confusion_matrix'] = cm
            
            # Normalized confusion matrix
            cm_normalized = confusion_matrix(y_true, y_pred, normalize='true')
            metrics['confusion_matrix_normalized'] = cm_normalized
            
            # Classification report
            metrics['classification_report'] = classification_report(y_true, y_pred, zero_division=0)
            
            # Per-class metrics
            precision_per_class = precision_score(y_true, y_pred, average=None, zero_division=0)
            recall_per_class = recall_score(y_true, y_pred, average=None, zero_division=0)
            f1_per_class = f1_score(y_true, y_pred, average=None, zero_division=0)
            
            metrics['per_class_metrics'] = {
                'precision': precision_per_class,
                'recall': recall_per_class,
                'f1': f1_per_class
            }
            
            # Additional metrics
            metrics['unique_classes'] = len(set(y_true))
            metrics['total_predictions'] = len(y_true)
            metrics['class_distribution'] = {
                'true': dict(pd.Series(y_true).value_counts()),
                'predicted': dict(pd.Series(y_pred).value_counts())
            }
            
            # Calculate top-k accuracy if probabilities are available
            if y_pred_proba is not None and label_encoder is not None:
                metrics.update(self.calculate_top_k_accuracy(y_true, y_pred_proba, label_encoder))
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error calculating metrics: {e}")
            return None
    
    def calculate_top_k_accuracy(self, y_true, y_pred_proba, label_encoder, k_values=[3, 5]):
        """Calculate top-k accuracy metrics"""
        top_k_metrics = {}
        
        for k in k_values:
            top_k_correct = 0
            y_true_encoded = label_encoder.transform(y_true)
            
            for i, true_label in enumerate(y_true_encoded):
                top_k_pred = np.argsort(y_pred_proba[i])[-k:]
                if true_label in top_k_pred:
                    top_k_correct += 1
            
            top_k_metrics[f'top_{k}_accuracy'] = top_k_correct / len(y_true)
        
        return top_k_metrics
    
    def cross_validation_evaluation(self, cv=5):
        """Perform cross-validation evaluation"""
        if not hasattr(self, 'X') or not hasattr(self, 'y_true'):
            if not self.prepare_evaluation_data():
                return None
        
        try:
            label_encoder = LabelEncoder()
            y_encoded = label_encoder.fit_transform(self.y_true)
            
            from sklearn.preprocessing import StandardScaler
            from sklearn.ensemble import RandomForestClassifier
            from sklearn.model_selection import cross_validate
            
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(self.X)
            
            model = RandomForestClassifier(
                n_estimators=50,
                max_depth=10,
                min_samples_split=2,
                min_samples_leaf=1,
                random_state=42
            )
            
            # Define scoring metrics
            scoring = {
                'accuracy': 'accuracy',
                'precision_macro': 'precision_macro',
                'recall_macro': 'recall_macro',
                'f1_macro': 'f1_macro'
            }
            
            # Perform cross-validation
            cv_results = cross_validate(model, X_scaled, y_encoded, cv=cv, scoring=scoring, return_train_score=True)
            
            cv_metrics = {
                'cv_accuracy_mean': np.mean(cv_results['test_accuracy']),
                'cv_accuracy_std': np.std(cv_results['test_accuracy']),
                'cv_precision_mean': np.mean(cv_results['test_precision_macro']),
                'cv_precision_std': np.std(cv_results['test_precision_macro']),
                'cv_recall_mean': np.mean(cv_results['test_recall_macro']),
                'cv_recall_std': np.std(cv_results['test_recall_macro']),
                'cv_f1_mean': np.mean(cv_results['test_f1_macro']),
                'cv_f1_std': np.std(cv_results['test_f1_macro']),
                'cv_folds': cv
            }
            
            return cv_metrics
            
        except Exception as e:
            logger.error(f"Error in cross-validation: {e}")
            return None
    
    def plot_confusion_matrix(self, metrics, figsize=(12, 10)):
        """Plot confusion matrix and normalized confusion matrix"""
        try:
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=figsize)
            
            # Regular confusion matrix
            cm = metrics['confusion_matrix']
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax1,
                       xticklabels=self.unique_recipes[:10],  # Show first 10 for readability
                       yticklabels=self.unique_recipes[:10])
            ax1.set_title('Confusion Matrix')
            ax1.set_xlabel('Predicted')
            ax1.set_ylabel('Actual')
            
            # Normalized confusion matrix
            cm_normalized = metrics['confusion_matrix_normalized']
            sns.heatmap(cm_normalized, annot=True, fmt='.2f', cmap='Blues', ax=ax2,
                       xticklabels=self.unique_recipes[:10],
                       yticklabels=self.unique_recipes[:10])
            ax2.set_title('Normalized Confusion Matrix')
            ax2.set_xlabel('Predicted')
            ax2.set_ylabel('Actual')
            
            plt.tight_layout()
            return fig
            
        except Exception as e:
            logger.error(f"Error plotting confusion matrix: {e}")
            return None
    
    def plot_metrics_summary(self, metrics, cv_metrics=None, figsize=(15, 10)):
        """Plot comprehensive metrics summary"""
        try:
            fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=figsize)
            
            # Main metrics bar chart
            main_metrics = ['accuracy', 'precision_weighted', 'recall_weighted', 'f1_weighted']
            main_values = [metrics[metric] for metric in main_metrics]
            
            bars = ax1.bar(main_metrics, main_values, color=['skyblue', 'lightcoral', 'lightgreen', 'gold'])
            ax1.set_title('Main Classification Metrics')
            ax1.set_ylabel('Score')
            ax1.set_ylim(0, 1)
            
            # Add value labels on bars
            for bar, value in zip(bars, main_values):
                ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                        f'{value:.3f}', ha='center', va='bottom')
            
            # Per-class F1 scores
            per_class_f1 = metrics['per_class_metrics']['f1']
            ax2.bar(range(len(per_class_f1)), per_class_f1, color='lightseagreen', alpha=0.7)
            ax2.set_title('Per-class F1 Scores')
            ax2.set_xlabel('Class Index')
            ax2.set_ylabel('F1 Score')
            ax2.set_ylim(0, 1)
            
            # Class distribution
            true_dist = list(metrics['class_distribution']['true'].values())
            pred_dist = list(metrics['class_distribution']['predicted'].values())
            
            x = range(len(true_dist))
            width = 0.35
            ax3.bar(x, true_dist, width, label='True', alpha=0.7, color='blue')
            ax3.bar([i + width for i in x], pred_dist, width, label='Predicted', alpha=0.7, color='red')
            ax3.set_title('Class Distribution: True vs Predicted')
            ax3.set_xlabel('Class Index')
            ax3.set_ylabel('Count')
            ax3.legend()
            
            # Cross-validation results (if available)
            if cv_metrics:
                cv_means = [cv_metrics['cv_accuracy_mean'], cv_metrics['cv_precision_mean'], 
                           cv_metrics['cv_recall_mean'], cv_metrics['cv_f1_mean']]
                cv_stds = [cv_metrics['cv_accuracy_std'], cv_metrics['cv_precision_std'], 
                          cv_metrics['cv_recall_std'], cv_metrics['cv_f1_std']]
                
                x_pos = np.arange(len(cv_means))
                ax4.bar(x_pos, cv_means, yerr=cv_stds, capsize=5, color='orange', alpha=0.7)
                ax4.set_title('Cross-Validation Results')
                ax4.set_xticks(x_pos)
                ax4.set_xticklabels(['Accuracy', 'Precision', 'Recall', 'F1'])
                ax4.set_ylabel('Score')
                ax4.set_ylim(0, 1)
            
            plt.tight_layout()
            return fig
            
        except Exception as e:
            logger.error(f"Error plotting metrics summary: {e}")
            return None
    
    def generate_evaluation_report(self, test_size=0.3, cv_folds=5):
        """Generate comprehensive evaluation report"""
        try:
            report = {}
            
            # Train-test split evaluation
            logger.info("Performing train-test split evaluation...")
            train_test_results = self.train_test_split_evaluation(test_size=test_size)
            
            if train_test_results is None:
                logger.error("Train-test evaluation failed")
                return None
            
            report['train_test_results'] = train_test_results
            
            # Cross-validation evaluation
            logger.info("Performing cross-validation evaluation...")
            cv_results = self.cross_validation_evaluation(cv=cv_folds)
            report['cross_validation_results'] = cv_results
            
            # Generate plots
            logger.info("Generating evaluation plots...")
            confusion_matrix_fig = self.plot_confusion_matrix(train_test_results)
            metrics_summary_fig = self.plot_metrics_summary(train_test_results, cv_results)
            
            report['plots'] = {
                'confusion_matrix': confusion_matrix_fig,
                'metrics_summary': metrics_summary_fig
            }
            
            # Print summary to console
            self.print_evaluation_summary(train_test_results, cv_results)
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating evaluation report: {e}")
            return None
    
    def print_evaluation_summary(self, metrics, cv_metrics=None):
        """Print comprehensive evaluation summary"""
        print("\n" + "="*80)
        print("RECIPE ML MODEL EVALUATION SUMMARY")
        print("="*80)
        
        print(f"\n📊 BASIC METRICS:")
        print(f"   Accuracy:          {metrics['accuracy']:.4f}")
        print(f"   Precision (macro): {metrics['precision_macro']:.4f}")
        print(f"   Recall (macro):    {metrics['recall_macro']:.4f}")
        print(f"   F1 Score (macro):  {metrics['f1_macro']:.4f}")
        
        print(f"\n📈 WEIGHTED METRICS:")
        print(f"   Precision (weighted): {metrics['precision_weighted']:.4f}")
        print(f"   Recall (weighted):    {metrics['recall_weighted']:.4f}")
        print(f"   F1 Score (weighted):  {metrics['f1_weighted']:.4f}")
        
        if 'top_3_accuracy' in metrics:
            print(f"\n🎯 TOP-K ACCURACY:")
            print(f"   Top-3 Accuracy: {metrics['top_3_accuracy']:.4f}")
        if 'top_5_accuracy' in metrics:
            print(f"   Top-5 Accuracy: {metrics['top_5_accuracy']:.4f}")
        
        print(f"\n📋 DATASET INFO:")
        print(f"   Total samples:      {metrics['total_predictions']}")
        print(f"   Unique recipes:     {metrics['unique_classes']}")
        
        if cv_metrics:
            print(f"\n🔄 CROSS-VALIDATION ({cv_metrics['cv_folds']} folds):")
            print(f"   Accuracy:   {cv_metrics['cv_accuracy_mean']:.4f} ± {cv_metrics['cv_accuracy_std']:.4f}")
            print(f"   Precision:  {cv_metrics['cv_precision_mean']:.4f} ± {cv_metrics['cv_precision_std']:.4f}")
            print(f"   Recall:     {cv_metrics['cv_recall_mean']:.4f} ± {cv_metrics['cv_recall_std']:.4f}")
            print(f"   F1 Score:   {cv_metrics['cv_f1_mean']:.4f} ± {cv_metrics['cv_f1_std']:.4f}")
        
        print(f"\n📝 CLASSIFICATION REPORT:")
        print(metrics['classification_report'])
        
        print("="*80)


# Integration with your existing RecipeMLModel
def evaluate_recipe_model(ml_model_instance):
    """Convenience function to evaluate your RecipeMLModel"""
    evaluator = RecipeModelEvaluator(ml_model_instance)
    
    print("🧪 Starting ML Model Evaluation...")
    report = evaluator.generate_evaluation_report()
    
    if report:
        print("\n✅ Evaluation completed successfully!")
        return report
    else:
        print("\n❌ Evaluation failed!")
        return None


# Usage example with your existing model
if __name__ == "__main__":
    # Initialize your model
    model = RecipeMLModel()
    
    # Fetch data and ensure model is ready
    model.fetch_recipes_from_db()
    
    # Run comprehensive evaluation
    evaluation_report = evaluate_recipe_model(model)
    
    # Save plots if needed
    if evaluation_report and 'plots' in evaluation_report:
        confusion_matrix_fig = evaluation_report['plots']['confusion_matrix']
        metrics_summary_fig = evaluation_report['plots']['metrics_summary']
        
        if confusion_matrix_fig:
            confusion_matrix_fig.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
        if metrics_summary_fig:
            metrics_summary_fig.savefig('metrics_summary.png', dpi=300, bbox_inches='tight')
        
        plt.show()