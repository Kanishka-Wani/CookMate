#!/usr/bin/env python3
"""
Recipe Ingredient Matching Evaluation - Tests ingredient-based matching performance
Evaluates the actual matching logic used in production with CORE INGREDIENTS
"""

import os
import json
import re
import logging
from collections import Counter
from typing import List, Dict, Tuple, Any
import random
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from difflib import SequenceMatcher
import matplotlib.patches as mpatches
from math import pi

# Add pymysql import
try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    print("❌ pymysql is required. Install with: pip install pymysql")
    raise

# -------------------------
# REPRODUCIBILITY FIXES
# -------------------------
# Set deterministic seeds for reproducibility
os.environ['PYTHONHASHSEED'] = '42'
random.seed(42)
np.random.seed(42)

logging.basicConfig(level=logging.INFO, format='%(message)s')
sns.set(style="whitegrid")
plt.rcParams.update({'font.size': 10})

class IngredientMatchingEvaluation:
    def __init__(self, db_host='localhost', db_user='root', db_password='', db_name='cookmatef'):
        self.db_host = db_host
        self.db_user = db_user
        self.db_password = db_password
        self.db_name = db_name
        self.connection = None
        self.recipes_df = None
        self.evaluation_results = {}
        
    def connect_to_database(self):
        """Connect to MySQL database"""
        try:
            self.connection = pymysql.connect(
                host=self.db_host,
                user=self.db_user,
                password=self.db_password,
                database=self.db_name,
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=True
            )
            logging.info(f"✅ Connected to database '{self.db_name}'")
            return True
        except Exception as e:
            logging.error(f"❌ Database connection failed: {e}")
            return False

    def fetch_recipes_with_core_ingredients(self, limit=200) -> pd.DataFrame:
        """Fetch recipes with CORE ingredients from database"""
        if not self.connection and not self.connect_to_database():
            return pd.DataFrame()

        try:
            cur = self.connection.cursor()
            # Query to get recipes with CORE ingredients
            query = """
                SELECT 
                    r.recipe_id, 
                    r.title, 
                    r.ingredients,
                    r.cuisine,
                    r.meal_type,
                    r.diet_type,
                    GROUP_CONCAT(DISTINCT i.ingredient_name ORDER BY i.ingredient_id SEPARATOR ',') as structured_ingredients,
                    GROUP_CONCAT(DISTINCT ci.ingredient_name ORDER BY rci.importance_score DESC SEPARATOR ',') as core_ingredients,
                    GROUP_CONCAT(DISTINCT rci.importance_score ORDER BY rci.importance_score DESC SEPARATOR ',') as importance_scores
                FROM recipes r
                LEFT JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
                LEFT JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
                LEFT JOIN recipe_core_ingredients rci ON r.recipe_id = rci.recipe_id
                LEFT JOIN ingredients ci ON rci.ingredient_id = ci.ingredient_id
                WHERE rci.is_essential = 1
                GROUP BY r.recipe_id
                HAVING core_ingredients IS NOT NULL
                ORDER BY r.recipe_id ASC
                LIMIT %s
            """
            cur.execute(query, (limit,))
            recipes = cur.fetchall()
            cur.close()

            if not recipes:
                logging.warning("❌ No recipes with core ingredients found in database")
                return pd.DataFrame()

            df = pd.DataFrame(recipes)

            # Parse core ingredients as primary source
            df['parsed_ingredients'] = df.apply(self._parse_recipe_ingredients_core, axis=1)
            df.sort_values('recipe_id', inplace=True, kind='mergesort')
            df.reset_index(drop=True, inplace=True)

            logging.info(f"✅ Fetched {len(df)} recipes with CORE ingredients from database")
            return df

        except Exception as e:
            logging.error(f"❌ Error fetching recipes with core ingredients: {e}")
            return pd.DataFrame()

    def fetch_recipes(self, limit=200) -> pd.DataFrame:
        """Fetch recipes from database - USING CORE INGREDIENTS"""
        return self.fetch_recipes_with_core_ingredients(limit)

    def _parse_recipe_ingredients_core(self, recipe):
        """Parse ingredients using CORE INGREDIENTS as primary source"""
        ingredients_list = []
        
        # Use CORE ingredients as primary source
        if recipe.get('core_ingredients'):
            core_list = [ing.strip().lower() for ing in str(recipe['core_ingredients']).split(',') if ing.strip()]
            ingredients_list.extend(core_list)
        
        # Fallback to structured ingredients if no core ingredients
        if not ingredients_list and recipe.get('structured_ingredients'):
            structured_list = [ing.strip().lower() for ing in str(recipe['structured_ingredients']).split(',') if ing.strip()]
            ingredients_list.extend(structured_list)
        
        # Final fallback to JSON field
        if not ingredients_list:
            ingredients_str = recipe.get('ingredients')
            if ingredients_str:
                try:
                    if isinstance(ingredients_str, str):
                        try:
                            cleaned_str = ingredients_str.replace("'", '"')
                            json_ingredients = json.loads(cleaned_str)
                        except json.JSONDecodeError:
                            json_ingredients = [ing.strip() for ing in ingredients_str.strip('[]').split(',')]
                        
                        if isinstance(json_ingredients, list):
                            for ing in json_ingredients:
                                if ing and str(ing).strip():
                                    normalized_ing = self._normalize_ingredient_name(str(ing))
                                    if normalized_ing:
                                        ingredients_list.append(normalized_ing)
                    else:
                        normalized_ing = self._normalize_ingredient_name(str(ingredients_str))
                        if normalized_ing:
                            ingredients_list.append(normalized_ing)
                except Exception as e:
                    logging.debug(f"Error parsing ingredients: {e}")
        
        # Normalize each and return sorted list for determinism
        normalized = sorted({self._normalize_ingredient_name(i) for i in ingredients_list if i})
        return normalized

    def _parse_recipe_ingredients(self, recipe):
        """Parse ingredients from both JSON and structured tables"""
        ingredients_list = []
        
        # Add ingredients from structured table
        if recipe.get('structured_ingredients'):
            structured_list = [ing.strip().lower() for ing in str(recipe['structured_ingredients']).split(',') if ing.strip()]
            ingredients_list.extend(structured_list)
        
        # Parse from JSON field
        ingredients_str = recipe.get('ingredients')
        if ingredients_str:
            try:
                if isinstance(ingredients_str, str):
                    try:
                        # Try to parse as JSON
                        cleaned_str = ingredients_str.replace("'", '"')
                        json_ingredients = json.loads(cleaned_str)
                    except json.JSONDecodeError:
                        # If not JSON, split by comma
                        json_ingredients = [ing.strip() for ing in ingredients_str.strip('[]').split(',')]
                    
                    if isinstance(json_ingredients, list):
                        for ing in json_ingredients:
                            if ing and str(ing).strip():
                                normalized_ing = self._normalize_ingredient_name(str(ing))
                                if normalized_ing:
                                    ingredients_list.append(normalized_ing)
                else:
                    normalized_ing = self._normalize_ingredient_name(str(ingredients_str))
                    if normalized_ing:
                        ingredients_list.append(normalized_ing)
            except Exception as e:
                logging.debug(f"Error parsing ingredients: {e}")
        
        # Normalize each and return sorted list for determinism
        normalized = sorted({self._normalize_ingredient_name(i) for i in ingredients_list if i})
        return normalized  # deterministic, sorted unique list

    def _normalize_ingredient_name(self, ingredient_text: str) -> str:
        """Normalize ingredient names for better matching"""
        if not ingredient_text:
            return ""
        
        # Convert to lowercase
        text = ingredient_text.lower().strip()
        
        # Remove quantities and measurements
        quantity_patterns = [
            r'\d+\s*(tsp|tbsp|cup|cups|gram|g|kg|ml|l|pinch|to taste|slice|slices)\s*',
            r'\d+[/\d]*\s*',
            r'[\d.,]+\s*',
            r'\([^)]*\)',
            r'\b(optional|fresh|dried|chopped|sliced|minced|grated|powdered)\b'
        ]
        
        for pattern in quantity_patterns:
            text = re.sub(pattern, '', text)
        
        # Remove extra spaces and common stop words
        stop_words = {'of', 'and', 'or', 'the', 'a', 'an', 'for', 'in', 'with', 'as'}
        words = [word for word in text.split() if word not in stop_words and len(word) > 2]
        
        # Remove plural forms (basic)
        normalized_words = []
        for word in words:
            if word.endswith('es'):
                word = word[:-2]
            elif word.endswith('s'):
                word = word[:-1]
            normalized_words.append(word)
        
        return ' '.join(normalized_words).strip()

    def string_similarity(self, a: str, b: str) -> float:
        """Calculate similarity between two strings using SequenceMatcher"""
        return SequenceMatcher(None, a.lower(), b.lower()).ratio()

    def ingredient_similarity_score(self, ing1: str, ing2: str) -> float:
        """Calculate similarity between two ingredients using multiple methods"""
        if not ing1 or not ing2:
            return 0.0
        
        ing1_clean = self._normalize_ingredient_name(ing1)
        ing2_clean = self._normalize_ingredient_name(ing2)
        
        # Exact match after normalization
        if ing1_clean == ing2_clean:
            return 1.0
        
        # One contains the other
        if ing1_clean in ing2_clean or ing2_clean in ing1_clean:
            return 0.9
        
        # SequenceMatcher for similar spellings
        similarity = self.string_similarity(ing1_clean, ing2_clean)
        if similarity > 0.8:
            return similarity
        
        # Word overlap
        words1 = set(ing1_clean.split())
        words2 = set(ing2_clean.split())
        if words1 and words2:
            overlap = len(words1.intersection(words2))
            union = len(words1.union(words2))
            if union > 0:
                jaccard_similarity = overlap / union
                if jaccard_similarity > 0.5:
                    return jaccard_similarity
        
        return 0.0

    def find_matching_ingredients(self, user_ingredients: List[str], recipe_ingredients: List[str]) -> Tuple[int, List[str]]:
        """Find matching ingredients between user and recipe with similarity threshold"""
        user_ingredients_lower = [ing.lower() for ing in user_ingredients]
        recipe_ingredients_lower = [ing.lower() for ing in recipe_ingredients]
        
        matching_ingredients = []
        matching_count = 0
        
        for recipe_ing in recipe_ingredients_lower:
            matched = False
            for user_ing in user_ingredients_lower:
                similarity = self.ingredient_similarity_score(user_ing, recipe_ing)
                if similarity > 0.7:  # Similarity threshold
                    matching_count += 1
                    matching_ingredients.append(recipe_ing)
                    matched = True
                    break
            
            # If no direct match, try normalized versions
            if not matched:
                recipe_normalized = self._normalize_ingredient_name(recipe_ing)
                for user_ing in user_ingredients_lower:
                    user_normalized = self._normalize_ingredient_name(user_ing)
                    if recipe_normalized and user_normalized:
                        if (recipe_normalized in user_normalized or 
                            user_normalized in recipe_normalized or
                            recipe_normalized == user_normalized):
                            matching_count += 1
                            matching_ingredients.append(recipe_ing)
                            matched = True
                            break
        
        return matching_count, matching_ingredients

    def evaluate_matching_performance(self, test_cases: List[Dict] = None, match_threshold: float = 30.0):
        """Evaluate the ingredient matching performance with CORE INGREDIENTS"""
        logging.info("🎯 Evaluating Ingredient Matching Performance with CORE INGREDIENTS...")
        
        self.recipes_df = self.fetch_recipes()
        if self.recipes_df.empty:
            logging.error("❌ No recipes available for evaluation")
            return False

        # Load saved test cases if available to guarantee repeatability
        if test_cases is None and os.path.exists("test_cases.json"):
            try:
                with open("test_cases.json", "r") as f:
                    test_cases = json.load(f)
                logging.info("✅ Loaded deterministic test_cases.json")
            except Exception as e:
                logging.warning(f"⚠️ Could not load test_cases.json: {e}")
                test_cases = None
        
        # Generate test cases if not provided
        if test_cases is None:
            test_cases = self._generate_test_cases()
            try:
                with open("test_cases.json", "w") as f:
                    json.dump(test_cases, f, indent=2)
                logging.info("✅ Saved generated test_cases.json for reproducibility")
            except Exception as e:
                logging.warning(f"⚠️ Could not save test_cases.json: {e}")
        
        results = []
        
        for i, test_case in enumerate(test_cases):
            user_ingredients = test_case['user_ingredients']
            expected_recipe = test_case['expected_recipe']
            actual_recipe_ingredients = test_case['actual_recipe_ingredients']
            
            # Get recommendations using actual matching logic with CORE ingredients
            recommendations = self._get_recommendations(user_ingredients, match_threshold=match_threshold)
            
            # Check if expected recipe is in recommendations
            expected_found = any(rec['title'] == expected_recipe for rec in recommendations)
            expected_rank = None
            expected_match_percentage = 0
            
            if expected_found:
                for idx, rec in enumerate(recommendations):
                    if rec['title'] == expected_recipe:
                        expected_rank = idx + 1
                        expected_match_percentage = rec['match_percentage']
                        break
            
            # Calculate actual matching metrics with CORE ingredients
            matching_count, matching_ingredients = self.find_matching_ingredients(
                user_ingredients, actual_recipe_ingredients
            )
            actual_match_percentage = (matching_count / len(actual_recipe_ingredients)) * 100 if actual_recipe_ingredients else 0
            
            result = {
                'test_case': i + 1,
                'user_ingredients': user_ingredients,
                'expected_recipe': expected_recipe,
                'expected_found': expected_found,
                'expected_rank': expected_rank,
                'expected_match_percentage': expected_match_percentage,
                'actual_match_percentage': actual_match_percentage,
                'matching_count': matching_count,
                'total_ingredients': len(actual_recipe_ingredients),
                'matching_ingredients': matching_ingredients,
                'top_recommendation': recommendations[0]['title'] if recommendations else None,
                'top_match_percentage': recommendations[0]['match_percentage'] if recommendations else 0,
                'total_recommendations': len(recommendations)
            }
            
            results.append(result)
        
        # Calculate overall metrics
        found_count = sum(1 for r in results if r['expected_found'])
        success_rate = found_count / len(test_cases) if test_cases else 0
        
        # Calculate matching accuracy metrics
        match_percentages = [r['actual_match_percentage'] for r in results]
        avg_match_percentage = np.mean(match_percentages) if match_percentages else 0
        
        ranks = [r['expected_rank'] for r in results if r['expected_rank']]
        avg_rank = np.mean(ranks) if ranks else None
        
        # Precision, Recall, F1-Score, and Accuracy
        true_positives = found_count
        false_positives = sum(1 for r in results if not r['expected_found'] and r['total_recommendations'] > 0)
        false_negatives = len(test_cases) - found_count
        true_negatives = 0  # In matching context, true negatives are hard to define
        
        precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
        recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        # Calculate Accuracy (proportion of correct predictions)
        accuracy = true_positives / len(test_cases) if test_cases else 0
        
        # Create confusion matrix data
        confusion_matrix_data = self._create_confusion_matrix_data(results)
        
        self.evaluation_results = {
            'accuracy': accuracy,
            'success_rate': success_rate,
            'precision': precision,
            'recall': recall,
            'f1_score': f1_score,
            'found_count': found_count,
            'total_tests': len(test_cases),
            'avg_match_percentage': avg_match_percentage,
            'avg_rank': avg_rank,
            'match_threshold_used': match_threshold,
            'detailed_results': results,
            'confusion_matrix': confusion_matrix_data,
            'matching_statistics': {
                'min_match_percentage': min(match_percentages) if match_percentages else 0,
                'max_match_percentage': max(match_percentages) if match_percentages else 0,
                'median_match_percentage': np.median(match_percentages) if match_percentages else 0,
                'std_match_percentage': np.std(match_percentages) if match_percentages else 0
            },
            'classification_metrics': {
                'true_positives': true_positives,
                'false_positives': false_positives,
                'false_negatives': false_negatives,
                'true_negatives': true_negatives
            }
        }
        
        logging.info(f"✅ Ingredient Matching Evaluation Complete!")
        logging.info(f"📊 Accuracy: {accuracy:.3f}")
        logging.info(f"📊 Success Rate: {success_rate:.1%} ({found_count}/{len(test_cases)})")
        logging.info(f"📊 Average Match Percentage: {avg_match_percentage:.1f}%")
        logging.info(f"📊 Precision: {precision:.3f}, Recall: {recall:.3f}, F1-Score: {f1_score:.3f}")
        
        return True

    def _create_confusion_matrix_data(self, results):
        """Create confusion matrix data for matching performance"""
        # Binary classification: Found (Positive) vs Not Found (Negative)
        actual_positives = [1 if r['expected_found'] else 0 for r in results]
        predicted_positives = [1 if r['total_recommendations'] > 0 else 0 for r in results]
        
        # Calculate confusion matrix values
        tp = sum(1 for a, p in zip(actual_positives, predicted_positives) if a == 1 and p == 1)
        fp = sum(1 for a, p in zip(actual_positives, predicted_positives) if a == 0 and p == 1)
        fn = sum(1 for a, p in zip(actual_positives, predicted_positives) if a == 1 and p == 0)
        tn = sum(1 for a, p in zip(actual_positives, predicted_positives) if a == 0 and p == 0)
        
        return {
            'matrix': [[tp, fp], [fn, tn]],
            'labels': ['Found', 'Not Found'],
            'categories': ['Recommended', 'Not Recommended']
        }

    def _generate_test_cases(self) -> List[Dict]:
        """Generate realistic test cases from actual recipes using CORE INGREDIENTS"""
        test_cases = []
        
        for _, recipe in self.recipes_df.iterrows():
            recipe_ingredients = recipe['parsed_ingredients']
            
            if len(recipe_ingredients) < 3:
                continue
                
            # Create multiple test cases per recipe with different ingredient subsets
            test_variations = [
                recipe_ingredients[:len(recipe_ingredients)//2],  # Half the ingredients
                recipe_ingredients[:len(recipe_ingredients)//3],  # One third
                recipe_ingredients[::2],  # Every other ingredient
            ]
            
            for user_ingredients in test_variations:
                if len(user_ingredients) >= 2:  # Need at least 2 ingredients to test
                    test_cases.append({
                        'user_ingredients': user_ingredients,
                        'expected_recipe': recipe['title'],
                        'actual_recipe_ingredients': recipe_ingredients
                    })
            
            # Limit total test cases
            if len(test_cases) >= 50:
                break
        
        # Ensure deterministic ordering of test cases
        return test_cases

    def _get_recommendations(self, user_ingredients: List[str], match_threshold: float = 30.0, top_n: int = 5) -> List[Dict]:
        """Get recommendations using the actual matching logic with CORE INGREDIENTS"""
        recommendations = []
        
        for _, recipe in self.recipes_df.iterrows():
            recipe_ingredients = recipe['parsed_ingredients']
            
            if not recipe_ingredients:
                continue
            
            # Calculate matching using the same logic as production
            matching_count, matching_ingredients = self.find_matching_ingredients(
                user_ingredients, recipe_ingredients
            )
            
            # Calculate match percentage
            match_percentage = (matching_count / len(recipe_ingredients)) * 100
            
            # Apply the same filtering criteria as production
            if match_percentage >= match_threshold:
                recommendations.append({
                    'title': recipe['title'],
                    'match_percentage': match_percentage,
                    'matching_count': matching_count,
                    'total_ingredients': len(recipe_ingredients),
                    'matching_ingredients': matching_ingredients,
                    'cuisine': recipe['cuisine']
                })
        
        # Sort by match percentage (highest first)
        recommendations.sort(key=lambda x: x['match_percentage'], reverse=True)
        return recommendations[:top_n]

    def _create_radar_chart(self, ax, evaluation_results):
        """Create a corrected radar chart for performance metrics"""
        # Radar chart requires values arranged cyclically and proper angles
        categories = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'Success Rate']
        # values must be between 0 and 1
        values = [
            evaluation_results['accuracy'],
            evaluation_results['precision'],
            evaluation_results['recall'],
            evaluation_results['f1_score'],
            evaluation_results['success_rate']
        ]
        
        # Ensure values length matches categories
        N = len(categories)
        angles = [n / float(N) * 2 * pi for n in range(N)]
        angles += angles[:1]  # complete the loop

        vals = values + values[:1]

        # Clear the axis and set up polar projection
        ax.clear()
        ax.set_theta_offset(pi / 2)
        ax.set_theta_direction(-1)

        # Draw one axe per variable + add labels
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(categories)

        # Draw ylabels
        ax.set_rlabel_position(0)
        ax.set_yticks([0.2, 0.4, 0.6, 0.8])
        ax.set_yticklabels(['0.2','0.4','0.6','0.8'])
        ax.set_ylim(0, 1)

        # Plot data
        ax.plot(angles, vals, linewidth=2, linestyle='solid')
        ax.fill(angles, vals, alpha=0.25)

        # Add a title
        ax.set_title('Performance Radar Chart', y=1.1, fontweight='bold')

        # Add numeric labels for each axis at the value point
        for angle, v, label in zip(angles, vals, categories + [categories[0]]):
            # avoid labeling the duplicate closing point twice
            if label == categories[0] and angle == angles[-1]:
                continue
            ax.text(angle, v + 0.04, f'{v:.2f}', horizontalalignment='center', verticalalignment='center', fontsize=9, fontweight='bold')

    def generate_matching_charts(self, out_dir='matching_charts'):
        """Generate comprehensive matching evaluation charts"""
        os.makedirs(out_dir, exist_ok=True)
        er = self.evaluation_results
        
        if not er:
            logging.error("❌ No evaluation results found")
            return

        try:
            # 1. Overall Performance Dashboard
            fig, axes = plt.subplots(2, 3, figsize=(20, 12), subplot_kw={'projection': None})
            fig.suptitle('Ingredient Matching Performance Evaluation (CORE INGREDIENTS)', fontsize=16, fontweight='bold')
            
            # Flatten axes for easier indexing
            ax1, ax2, ax3, ax4, ax5, ax6 = axes.flatten()
            
            # 1.1 Success Rate
            success_rate = er['success_rate']
            ax1.bar(['Success Rate'], [success_rate], color=['#2E86AB' if success_rate > 0.7 else '#A23B72'])
            ax1.set_ylim(0, 1)
            ax1.set_ylabel('Rate')
            ax1.set_title('Recipe Matching Success Rate')
            ax1.text(0, success_rate + 0.02, f'{success_rate:.1%}', ha='center', fontweight='bold', fontsize=12)
            
            # 1.2 Match Percentage Distribution
            match_percentages = [r['actual_match_percentage'] for r in er['detailed_results']]
            ax2.hist(match_percentages, bins=10, alpha=0.7, color='#F18F01', edgecolor='black')
            ax2.set_xlabel('Match Percentage (%)')
            ax2.set_ylabel('Frequency')
            ax2.set_title('Distribution of Match Percentages')
            ax2.axvline(er['match_threshold_used'], color='red', linestyle='--', 
                       label=f'Threshold: {er["match_threshold_used"]}%')
            ax2.axvline(np.mean(match_percentages), color='blue', linestyle='--', 
                       label=f'Mean: {np.mean(match_percentages):.1f}%')
            ax2.legend()
            
            # 1.3 Performance Metrics Bar Chart
            metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
            values = [er['accuracy'], er['precision'], er['recall'], er['f1_score']]
            colors = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D']
            bars = ax3.bar(metrics, values, color=colors, alpha=0.8)
            ax3.set_ylim(0, 1)
            ax3.set_ylabel('Score')
            ax3.set_title('Performance Metrics Comparison')
            for bar, value in zip(bars, values):
                ax3.text(bar.get_x() + bar.get_width()/2, value + 0.02, f'{value:.3f}', 
                        ha='center', fontweight='bold')
            
            # 1.4 Confusion Matrix
            cm_data = er['confusion_matrix']
            cm = np.array(cm_data['matrix'])
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax4, 
                       xticklabels=cm_data['categories'], yticklabels=cm_data['labels'])
            ax4.set_title('Confusion Matrix')
            ax4.set_xlabel('Predicted')
            ax4.set_ylabel('Actual')
            
            # 1.5 Normalized Confusion Matrix
            # handle rows that sum to zero
            with np.errstate(divide='ignore', invalid='ignore'):
                row_sums = cm.sum(axis=1)[:, np.newaxis]
                cm_normalized = np.divide(cm.astype('float'), row_sums, where=(row_sums != 0))
            sns.heatmap(cm_normalized, annot=True, fmt='.2%', cmap='Blues', ax=ax5,
                       xticklabels=cm_data['categories'], yticklabels=cm_data['labels'])
            ax5.set_title('Normalized Confusion Matrix')
            ax5.set_xlabel('Predicted')
            ax5.set_ylabel('Actual')
            
            # 1.6 Radar Chart (corrected)
            # create a polar subplot for the radar chart
            ax6_polar = fig.add_subplot(2, 3, 6, projection='polar')
            self._create_radar_chart(ax6_polar, er)
            
            plt.tight_layout(rect=[0, 0.03, 1, 0.95])
            plt.savefig(os.path.join(out_dir, 'matching_performance_dashboard.png'), dpi=150, bbox_inches='tight')
            plt.close()

            # 2. Detailed Test Case Analysis
            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))
            
            # 2.1 Individual test case results
            test_cases = range(1, len(er['detailed_results']) + 1)
            actual_pct = [r['actual_match_percentage'] for r in er['detailed_results']]
            expected_pct = [r['expected_match_percentage'] for r in er['detailed_results']]
            found = [r['expected_found'] for r in er['detailed_results']]
            
            width = 0.35
            x = np.arange(len(test_cases))
            
            bars1 = ax1.bar(x - width/2, actual_pct, width, label='Actual Match %', alpha=0.7)
            bars2 = ax1.bar(x + width/2, expected_pct, width, label='Expected Match %', alpha=0.7)
            
            # Color bars based on whether expected recipe was found
            for i, (bar1, bar2, found_status) in enumerate(zip(bars1, bars2, found)):
                color = 'green' if found_status else 'red'
                bar1.set_color(color)
                bar2.set_color(color)
                bar2.set_alpha(0.5)
            
            ax1.set_xlabel('Test Case')
            ax1.set_ylabel('Match Percentage (%)')
            ax1.set_title('Individual Test Case Results\n(Green=Found, Red=Not Found)')
            ax1.axhline(y=er['match_threshold_used'], color='red', linestyle='--', alpha=0.5, 
                       label=f'{er["match_threshold_used"]}% Threshold')
            ax1.legend()
            ax1.set_xticks(x)
            ax1.set_xticklabels([f'TC{i+1}' for i in range(len(test_cases))], rotation=45)
            
            # 2.2 Matching statistics by recipe
            recipe_stats = {}
            for result in er['detailed_results']:
                recipe = result['expected_recipe']
                if recipe not in recipe_stats:
                    recipe_stats[recipe] = []
                recipe_stats[recipe].append(result['actual_match_percentage'])
            
            # Top 10 recipes by average match percentage
            avg_matches = {recipe: np.mean(percentages) for recipe, percentages in recipe_stats.items()}
            top_recipes = sorted(avg_matches.items(), key=lambda x: x[1], reverse=True)[:10]
            
            if top_recipes:
                recipes, avg_pct = zip(*top_recipes)
                y_pos = np.arange(len(recipes))
                bars = ax2.barh(y_pos, avg_pct, color='teal', alpha=0.7)
                ax2.set_yticks(y_pos)
                ax2.set_yticklabels([r[:25] + '...' if len(r) > 25 else r for r in recipes])
                ax2.set_xlabel('Average Match Percentage (%)')
                ax2.set_title('Top 10 Recipes by Average Match Percentage')
                ax2.invert_yaxis()
                
                # Add value labels
                for bar, value in zip(bars, avg_pct):
                    ax2.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2, 
                            f'{value:.1f}%', ha='left', va='center')
            
            plt.tight_layout()
            plt.savefig(os.path.join(out_dir, 'detailed_analysis.png'), dpi=150, bbox_inches='tight')
            plt.close()

            # 3. Matching Quality Analysis
            fig, ax = plt.subplots(figsize=(12, 8))
            
            # Scatter plot: User ingredients vs Match percentage
            user_ing_counts = [len(r['user_ingredients']) for r in er['detailed_results']]
            match_percentages = [r['actual_match_percentage'] for r in er['detailed_results']]
            found_status = [r['expected_found'] for r in er['detailed_results']]
            
            colors = ['green' if found else 'red' for found in found_status]
            scatter = ax.scatter(user_ing_counts, match_percentages, c=colors, alpha=0.6, s=60)
            
            ax.set_xlabel('Number of User Ingredients')
            ax.set_ylabel('Match Percentage (%)')
            ax.set_title('Matching Quality vs Input Ingredients\n(Green=Found, Red=Not Found)')
            ax.axhline(y=er['match_threshold_used'], color='red', linestyle='--', alpha=0.5, 
                      label=f'{er["match_threshold_used"]}% Threshold')
            ax.legend()
            
            # Add trend line
            if len(user_ing_counts) > 1:
                z = np.polyfit(user_ing_counts, match_percentages, 1)
                p = np.poly1d(z)
                # Sort x for line plotting to make it look smooth
                sorted_idx = np.argsort(user_ing_counts)
                ax.plot(np.array(user_ing_counts)[sorted_idx], p(np.array(user_ing_counts)[sorted_idx]), "b--", alpha=0.5, label='Trend')
                ax.legend()
            
            plt.tight_layout()
            plt.savefig(os.path.join(out_dir, 'matching_quality_analysis.png'), dpi=150, bbox_inches='tight')
            plt.close()

            # 4. Enhanced Performance Metrics Chart
            self._create_enhanced_performance_chart(er, out_dir)

            logging.info(f"📁 Saved matching evaluation charts to {out_dir}")

        except Exception as e:
            logging.error(f"❌ Error generating matching charts: {e}")

    def _create_enhanced_performance_chart(self, evaluation_results, out_dir):
        """Create enhanced performance metrics visualization"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
        
        # 1. Comprehensive Metrics Comparison
        metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'Success Rate']
        values = [
            evaluation_results['accuracy'],
            evaluation_results['precision'],
            evaluation_results['recall'], 
            evaluation_results['f1_score'],
            evaluation_results['success_rate']
        ]
        colors = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#3E8C47']
        
        bars = ax1.bar(metrics, values, color=colors, alpha=0.8, edgecolor='black')
        ax1.set_ylim(0, 1)
        ax1.set_ylabel('Score')
        ax1.set_title('Comprehensive Performance Metrics')
        ax1.grid(True, alpha=0.3)
        
        # Add value labels on bars
        for bar, value in zip(bars, values):
            ax1.text(bar.get_x() + bar.get_width()/2, value + 0.02, f'{value:.3f}', 
                    ha='center', fontweight='bold', fontsize=10)
        
        # 2. Metric Distribution Comparison
        metric_data = {
            'Accuracy': evaluation_results['accuracy'],
            'Precision': evaluation_results['precision'],
            'Recall': evaluation_results['recall'],
            'F1-Score': evaluation_results['f1_score']
        }
        
        metrics_list = list(metric_data.keys())
        values_list = list(metric_data.values())
        
        # Create a horizontal bar chart
        y_pos = np.arange(len(metrics_list))
        bars = ax2.barh(y_pos, values_list, color='purple', alpha=0.7)
        ax2.set_yticks(y_pos)
        ax2.set_yticklabels(metrics_list)
        ax2.set_xlabel('Score')
        ax2.set_title('Performance Metrics Distribution')
        ax2.set_xlim(0, 1)
        ax2.grid(True, alpha=0.3)
        
        # Add value labels
        for bar, value in zip(bars, values_list):
            ax2.text(bar.get_width() + 0.02, bar.get_y() + bar.get_height()/2, 
                    f'{value:.3f}', ha='left', va='center', fontweight='bold')
        
        plt.tight_layout()
        plt.savefig(os.path.join(out_dir, 'enhanced_performance_metrics.png'), dpi=150, bbox_inches='tight')
        plt.close()

    def print_detailed_report(self):
        """Print comprehensive matching evaluation report"""
        er = self.evaluation_results
        if not er:
            print("❌ No evaluation results available.")
            return
        
        print("\n" + "="*80)
        print("🔍 INGREDIENT MATCHING PERFORMANCE EVALUATION REPORT (CORE INGREDIENTS)")
        print("="*80)
        
        print(f"\n🎯 MATCHING PERFORMANCE:")
        print(f"   Accuracy:            {er['accuracy']:.3f}")
        print(f"   Success Rate:        {er['success_rate']:.1%} ({er['found_count']}/{er['total_tests']})")
        print(f"   Precision:           {er['precision']:.3f}")
        print(f"   Recall:              {er['recall']:.3f}")
        print(f"   F1-Score:            {er['f1_score']:.3f}")
        print(f"   Average Match %:     {er['avg_match_percentage']:.1f}%")
        if er['avg_rank']:
            print(f"   Average Rank:        {er['avg_rank']:.1f}")
        
        print(f"\n📊 MATCHING STATISTICS:")
        stats = er['matching_statistics']
        print(f"   Minimum Match %:     {stats['min_match_percentage']:.1f}%")
        print(f"   Maximum Match %:     {stats['max_match_percentage']:.1f}%")
        print(f"   Median Match %:      {stats['median_match_percentage']:.1f}%")
        print(f"   Std Dev Match %:     {stats['std_match_percentage']:.1f}%")
        print(f"   Matching Threshold:  {er['match_threshold_used']}%")
        
        print(f"\n🔧 TEST CONFIGURATION:")
        print(f"   Test Cases:          {er['total_tests']}")
        print(f"   Recipes in DB:       {len(self.recipes_df)}")
        print(f"   Matching Logic:      Ingredient similarity > 70%")
        print(f"   Data Source:         CORE INGREDIENTS (recipe_core_ingredients table)")
        
        # Confusion Matrix Summary
        cm = er['confusion_matrix']
        print(f"\n📈 CONFUSION MATRIX SUMMARY:")
        print(f"   True Positives:      {cm['matrix'][0][0]}")
        print(f"   False Positives:     {cm['matrix'][0][1]}")
        print(f"   False Negatives:     {cm['matrix'][1][0]}")
        print(f"   True Negatives:      {cm['matrix'][1][1]}")
        
        print(f"\n🏆 TOP PERFORMING MATCHES:")
        top_matches = sorted(er['detailed_results'], key=lambda x: x['actual_match_percentage'], reverse=True)[:3]
        for i, match in enumerate(top_matches, 1):
            status = "✅ FOUND" if match['expected_found'] else "❌ MISSED"
            rank_info = f" (Rank: {match['expected_rank']})" if match['expected_rank'] else ""
            print(f"   {i}. {match['expected_recipe']} - {match['actual_match_percentage']:.1f}% {status}{rank_info}")
        
        print(f"\n📈 RECOMMENDATIONS:")
        if er['accuracy'] < 0.7:
            print("   • Consider lowering the match threshold for better recall")
            print("   • Improve ingredient normalization for better matching")
            print("   • Add more ingredient synonyms and variations")
            print("   • Review core ingredient importance scores in database")
        else:
            print("   • Current matching logic with CORE ingredients is performing well!")
            print("   • Consider fine-tuning the similarity threshold")
            print("   • Core ingredient approach provides focused matching")
        
        print(f"\n💾 OUTPUT FILES:")
        chart_dir = os.path.abspath('matching_charts')
        print(f"   Performance Dashboard: {chart_dir}/matching_performance_dashboard.png")
        print(f"   Detailed Analysis:     {chart_dir}/detailed_analysis.png")
        print(f"   Quality Analysis:      {chart_dir}/matching_quality_analysis.png")
        print(f"   Enhanced Metrics:      {chart_dir}/enhanced_performance_metrics.png")
        
        print("\n" + "="*80)

def main():
    print("🚀 INGREDIENT MATCHING EVALUATION - Starting (CORE INGREDIENTS)")
    print("="*65)
    
    evaluator = IngredientMatchingEvaluation()
    
    if not evaluator.connect_to_database():
        print("❌ Database connection failed. Exiting.")
        return

    # Evaluate ingredient matching performance with 30% threshold
    success = evaluator.evaluate_matching_performance(match_threshold=30.0)
    if not success:
        print("❌ Evaluation failed. Exiting.")
        return

    # Generate charts
    evaluator.generate_matching_charts(out_dir='matching_charts')

    # Print evaluation report
    evaluator.print_detailed_report()
    
    print("🎉 Ingredient matching evaluation with CORE INGREDIENTS complete!")

if __name__ == "__main__":
    main()