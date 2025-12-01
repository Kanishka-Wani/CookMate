import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import json
import logging
import re
from django.db import connection
from typing import List, Dict, Any, Tuple
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)


class RecipeMLModel:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.feature_columns = []
        self.is_trained = False
        self.all_recipes = []
        self.ingredient_vocabulary = set()
        self.core_ingredients_cache = {}
    
    def fetch_recipes_with_core_ingredients(self):
        """Fetch all recipes with their CORE ingredients from the new table"""
        try:
            with connection.cursor() as cursor:
                query = """
                SELECT 
                    r.recipe_id, 
                    r.title, 
                    r.description,
                    r.cuisine,
                    r.difficulty,
                    r.cooking_time,
                    r.ingredients,
                    r.instructions,
                    r.image_url,
                    r.meal_type,
                    r.diet_type,
                    r.serving_size,
                    r.rating,
                    GROUP_CONCAT(DISTINCT i.ingredient_name) as core_ingredients,
                    GROUP_CONCAT(DISTINCT rci.category) as ingredient_categories,
                    GROUP_CONCAT(DISTINCT rci.importance_score) as importance_scores
                FROM recipes r
                LEFT JOIN recipe_core_ingredients rci ON r.recipe_id = rci.recipe_id
                LEFT JOIN ingredients i ON rci.ingredient_id = i.ingredient_id
                WHERE rci.is_essential = 1
                GROUP BY r.recipe_id
                HAVING core_ingredients IS NOT NULL
                """
                cursor.execute(query)
                recipes = cursor.fetchall()
                
                recipe_list = []
                for recipe in recipes:
                    recipe_dict = {
                        'recipe_id': recipe[0],
                        'title': recipe[1],
                        'description': recipe[2] or '',
                        'cuisine': recipe[3] or 'Indian',
                        'difficulty': recipe[4] or 'Medium',
                        'cooking_time': recipe[5] or 30,
                        'ingredients': recipe[6],
                        'instructions': recipe[7],
                        'image_url': recipe[8],
                        'meal_type': recipe[9] or 'Dinner',
                        'diet_type': recipe[10] or 'Vegetarian',
                        'serving_size': recipe[11] or 4,
                        'rating': float(recipe[12]) if recipe[12] else 4.5,
                        'core_ingredients': recipe[13].split(',') if recipe[13] else [],
                        'ingredient_categories': recipe[14].split(',') if recipe[14] else [],
                        'importance_scores': [float(x) for x in recipe[15].split(',')] if recipe[15] else []
                    }
                    recipe_list.append(recipe_dict)
                
                logger.info(f"Fetched {len(recipe_list)} recipes with core ingredients")
                self.all_recipes = recipe_list
                return recipe_list
                
        except Exception as e:
            logger.error(f"Error fetching recipes with core ingredients: {e}")
            return []
    
    def fetch_recipes_from_db(self):
        """Fetch all recipes with ingredients - USING CORE INGREDIENTS"""
        return self.fetch_recipes_with_core_ingredients()
    
    def get_core_ingredients_for_recipe(self, recipe_id: int) -> List[str]:
        """Get core ingredients for a specific recipe"""
        if recipe_id in self.core_ingredients_cache:
            return self.core_ingredients_cache[recipe_id]
        
        try:
            with connection.cursor() as cursor:
                query = """
                SELECT i.ingredient_name, rci.importance_score, rci.category
                FROM recipe_core_ingredients rci
                JOIN ingredients i ON rci.ingredient_id = i.ingredient_id
                WHERE rci.recipe_id = %s AND rci.is_essential = 1
                ORDER BY rci.importance_score DESC
                """
                cursor.execute(query, [recipe_id])
                ingredients = cursor.fetchall()
                
                core_ingredients = [ing[0] for ing in ingredients]
                self.core_ingredients_cache[recipe_id] = core_ingredients
                return core_ingredients
                
        except Exception as e:
            logger.error(f"Error fetching core ingredients for recipe {recipe_id}: {e}")
            return []
    
    def normalize_ingredient_name(self, ingredient_text: str) -> str:
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
    
    def parse_ingredients(self, ingredients_str, structured_ingredients=None):
        """Parse ingredients - NOW USING CORE INGREDIENTS"""
        ingredients_list = []
        
        # Use core ingredients as primary source
        if structured_ingredients:
            if isinstance(structured_ingredients, list):
                core_list = [ing.strip().lower() for ing in structured_ingredients if ing.strip()]
            else:
                core_list = [ing.strip().lower() for ing in structured_ingredients.split(',') if ing.strip()]
            ingredients_list.extend(core_list)
        
        # Fallback to JSON field if no core ingredients
        if not ingredients_list and ingredients_str:
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
                                normalized_ing = self.normalize_ingredient_name(str(ing))
                                if normalized_ing:
                                    ingredients_list.append(normalized_ing)
                else:
                    normalized_ing = self.normalize_ingredient_name(str(ingredients_str))
                    if normalized_ing:
                        ingredients_list.append(normalized_ing)
            except Exception as e:
                logger.error(f"Error parsing ingredients: {e}")
        
        return list(set(ingredients_list))
    
    def string_similarity(self, a: str, b: str) -> float:
        """Calculate similarity between two strings using SequenceMatcher"""
        return SequenceMatcher(None, a.lower(), b.lower()).ratio()
    
    def ingredient_similarity_score(self, ing1: str, ing2: str) -> float:
        """Calculate similarity between two ingredients using multiple methods"""
        if not ing1 or not ing2:
            return 0.0
        
        ing1_clean = self.normalize_ingredient_name(ing1)
        ing2_clean = self.normalize_ingredient_name(ing2)
        
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
                recipe_normalized = self.normalize_ingredient_name(recipe_ing)
                for user_ing in user_ingredients_lower:
                    user_normalized = self.normalize_ingredient_name(user_ing)
                    if recipe_normalized and user_normalized:
                        if (recipe_normalized in user_normalized or 
                            user_normalized in recipe_normalized or
                            recipe_normalized == user_normalized):
                            matching_count += 1
                            matching_ingredients.append(recipe_ing)
                            matched = True
                            break
        
        return matching_count, matching_ingredients
    
    def get_all_unique_ingredients(self, recipes):
        """Extract all unique CORE ingredients from recipes"""
        all_ingredients = set()
        for recipe in recipes:
            # Use core ingredients as primary source
            core_ingredients = recipe.get('core_ingredients', [])
            if core_ingredients:
                all_ingredients.update(core_ingredients)
            else:
                # Fallback to parsed ingredients
                ingredients = self.parse_ingredients(
                    recipe['ingredients'], 
                    recipe.get('structured_ingredients')
                )
                all_ingredients.update(ingredients)
        return list(all_ingredients)
    
    def prepare_features(self, user_ingredients: List[str], cuisine_type: str, 
                        meal_type: str, diet_type: str, serving_size: int):
        """Prepare feature vector for ML model using CORE ingredients"""
        features = {}
        
        # Get recipes and all core ingredients
        recipes = self.fetch_recipes_from_db()
        all_ingredients = self.get_all_unique_ingredients(recipes)
        
        # Binary features for core ingredients (top 50 most common)
        user_ingredients_lower = [ing.lower() for ing in user_ingredients]
        for ingredient in all_ingredients[:50]:  # Increased to 50 for better coverage
            feature_name = f'ing_{ingredient.replace(" ", "_").replace("-", "_")[:20]}'
            # Improved matching with similarity score
            has_ingredient = any(
                self.ingredient_similarity_score(user_ing, ingredient) > 0.7
                for user_ing in user_ingredients_lower
            )
            features[feature_name] = 1 if has_ingredient else 0
        
        # Cuisine type features
        cuisines = ['north indian', 'south indian', 'maharashtrian', 'gujarati', 'punjabi', 'bengali', 'hyderabadi']
        for cuisine in cuisines:
            features[f'cuisine_{cuisine.replace(" ", "_")}'] = 1 if cuisine_type.lower() == cuisine else 0
        
        # Meal type features
        meal_types = ['breakfast', 'lunch', 'dinner', 'snack', 'beverage']
        for meal in meal_types:
            features[f'meal_{meal}'] = 1 if meal_type.lower() == meal else 0
        
        # Diet type features
        diet_types = ['vegetarian', 'vegan', 'non-vegetarian']
        for diet in diet_types:
            features[f'diet_{diet}'] = 1 if diet_type.lower() == diet else 0
        
        # Numerical features
        features['serving_size'] = min(serving_size / 10, 1.0)
        
        # Time preference based on meal type
        if meal_type.lower() == 'breakfast':
            features['prep_time_preference'] = 0.3
        elif meal_type.lower() == 'lunch':
            features['prep_time_preference'] = 0.6
        else:
            features['prep_time_preference'] = 0.8
        
        self.feature_columns = list(features.keys())
        return features
    
    def train(self):
        """Train the Random Forest model using CORE ingredients"""
        try:
            recipes = self.fetch_recipes_from_db()
            
            if len(recipes) < 3:
                logger.warning("Not enough recipes to train model. Need at least 3 recipes.")
                return False
            
            X = []
            y = []
            
            for recipe in recipes:
                # Use core ingredients as primary source
                ingredients = recipe.get('core_ingredients', [])
                if not ingredients:
                    # Fallback to parsed ingredients
                    ingredients = self.parse_ingredients(
                        recipe['ingredients'], 
                        recipe.get('structured_ingredients')
                    )
                
                if not ingredients:
                    continue
                    
                features = self.prepare_features(
                    user_ingredients=ingredients,
                    cuisine_type=recipe.get('cuisine', 'indian'),
                    meal_type=recipe.get('meal_type', 'dinner'),
                    diet_type=recipe.get('diet_type', 'vegetarian'),
                    serving_size=recipe.get('serving_size', 4)
                )
                
                X.append(list(features.values()))
                y.append(recipe['title'])
            
            if len(set(y)) < 2:
                logger.warning("Not enough recipe variety for training.")
                return False
            
            # Encode labels
            self.label_encoders['recipe'] = LabelEncoder()
            y_encoded = self.label_encoders['recipe'].fit_transform(y)
            
            # Split and train
            X_train, X_test, y_train, y_test = train_test_split(
                X, y_encoded, test_size=0.2, random_state=42
            )
            
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=15,
                min_samples_split=3,
                min_samples_leaf=2,
                random_state=42
            )
            
            self.model.fit(X_train_scaled, y_train)
            
            train_accuracy = self.model.score(X_train_scaled, y_train)
            test_accuracy = self.model.score(X_test_scaled, y_test)
            
            self.is_trained = True
            
            logger.info(f"Model trained successfully using CORE ingredients!")
            logger.info(f"Training Accuracy: {train_accuracy:.2f}")
            logger.info(f"Testing Accuracy: {test_accuracy:.2f}")
            logger.info(f"Recipes trained on: {len(recipes)}")
            logger.info(f"Features used: {len(self.feature_columns)}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error training model with core ingredients: {e}")
            return False
    
    def predict(self, user_ingredients: List[str], cuisine_type: str = 'All Cuisines',
               meal_type: str = 'All Meals', diet_type: str = 'All Diets', 
               serving_size: int = 4, top_n: int = 5, min_matching_ingredients: int = 2,
               min_match_percentage: float = 40.0):
        """Generate recipe predictions using CORE ingredients"""
        if not self.is_trained or self.model is None:
            logger.info("Model not trained. Training now...")
            if not self.train():
                return []
        
        try:
            # Get all recipes with core ingredients
            all_recipes = self.fetch_recipes_from_db()
            
            # Filter recipes by direct ingredient matching first
            matching_recipes = []
            user_ingredients_lower = [ing.lower() for ing in user_ingredients]
            
            for recipe in all_recipes:
                # Use core ingredients as primary source
                recipe_ingredients = recipe.get('core_ingredients', [])
                if not recipe_ingredients:
                    # Fallback to parsed ingredients
                    recipe_ingredients = self.parse_ingredients(
                        recipe['ingredients'],
                        recipe.get('structured_ingredients')
                    )
                
                if recipe_ingredients:
                    matching_count, matching_ingredients = self.find_matching_ingredients(
                        user_ingredients_lower, recipe_ingredients
                    )
                    
                    # Calculate match percentage
                    match_percentage = (matching_count / len(recipe_ingredients)) * 100
                    
                    # CRITICAL: Only consider recipes with at least 2 matching ingredients AND >40% match percentage
                    if matching_count >= min_matching_ingredients and match_percentage > min_match_percentage:
                        recipe_details = {
                            'recipe_id': recipe['recipe_id'],
                            'title': recipe['title'],
                            'description': recipe['description'],
                            'ingredients': recipe_ingredients,
                            'instructions': self.parse_instructions(recipe['instructions']),
                            'cooking_time': recipe['cooking_time'],
                            'difficulty': recipe['difficulty'],
                            'cuisine': recipe['cuisine'],
                            'image_url': recipe['image_url'],
                            'meal_type': recipe['meal_type'],
                            'diet_type': recipe['diet_type'],
                            'serving_size': recipe['serving_size'],
                            'rating': recipe['rating'],
                            'confidence_score': round(match_percentage, 2),
                            'matching_ingredients_count': matching_count,
                            'total_ingredients_count': len(recipe_ingredients),
                            'matching_ingredients': matching_ingredients
                        }
                        matching_recipes.append(recipe_details)
            
            # Sort by matching percentage and count (highest first)
            matching_recipes.sort(
                key=lambda x: (x['confidence_score'], x['matching_ingredients_count']), 
                reverse=True
            )
            
            logger.info(f"Found {len(matching_recipes)} recipes with at least {min_matching_ingredients} matching CORE ingredients and >{min_match_percentage}% match")
            return matching_recipes[:top_n]
            
        except Exception as e:
            logger.error(f"Error during prediction with core ingredients: {e}")
            return []
    
    def get_recipe_details(self, recipe_name: str):
        """Get complete recipe details using CORE ingredients"""
        try:
            with connection.cursor() as cursor:
                query = """
                SELECT r.recipe_id, r.title, r.description, r.ingredients, r.instructions, 
                       r.cooking_time, r.difficulty, r.cuisine, r.image_url, r.meal_type, r.diet_type,
                       r.serving_size, r.rating,
                       GROUP_CONCAT(i.ingredient_name) as core_ingredients
                FROM recipes r
                LEFT JOIN recipe_core_ingredients rci ON r.recipe_id = rci.recipe_id
                LEFT JOIN ingredients i ON rci.ingredient_id = i.ingredient_id
                WHERE r.title = %s AND rci.is_essential = 1
                GROUP BY r.recipe_id
                """
                cursor.execute(query, (recipe_name,))
                recipe = cursor.fetchone()
                
                if recipe:
                    # Generate description if missing
                    description = recipe[2]
                    if not description or description.strip() == '':
                        description = self.generate_description(recipe[1], recipe[7], recipe[9])
                    
                    # Use core ingredients as primary source
                    core_ingredients = recipe[13].split(',') if recipe[13] else []
                    ingredients_list = core_ingredients if core_ingredients else self.parse_ingredients(recipe[3])
                    
                    # Parse instructions into steps
                    instructions_steps = self.parse_instructions(recipe[4])
                    
                    return {
                        'recipe_id': recipe[0],
                        'title': recipe[1],
                        'description': description,
                        'ingredients': ingredients_list,
                        'instructions': instructions_steps,
                        'cooking_time': recipe[5],
                        'difficulty': recipe[6],
                        'cuisine': recipe[7],
                        'image_url': recipe[8],
                        'meal_type': recipe[9],
                        'diet_type': recipe[10],
                        'serving_size': recipe[11],
                        'rating': float(recipe[12]) if recipe[12] else 4.5
                    }
                return None
                
        except Exception as e:
            logger.error(f"Error fetching recipe details with core ingredients: {e}")
            return None

    def parse_instructions(self, instructions_text):
        """Parse instructions into step-by-step format"""
        if not instructions_text:
            return ["No instructions available."]
        
        try:
            # Try to parse as JSON array first
            if isinstance(instructions_text, str) and instructions_text.strip().startswith('['):
                try:
                    instructions_list = json.loads(instructions_text)
                    if isinstance(instructions_list, list) and instructions_list:
                        # Clean each step
                        cleaned_steps = []
                        for step in instructions_list:
                            if step and str(step).strip():
                                cleaned_steps.append(str(step).strip())
                        return cleaned_steps if cleaned_steps else ["No instructions available."]
                except json.JSONDecodeError:
                    pass
            
            # If not JSON or parsing failed, split by common delimiters
            instructions_str = str(instructions_text)
            
            # Try splitting by numbered steps (1., 2., etc.)
            steps = re.split(r'\d+\.', instructions_str)
            if len(steps) > 1:
                cleaned_steps = [step.strip() for step in steps if step.strip()]
                if cleaned_steps:
                    return cleaned_steps
            
            # Try splitting by newlines
            steps = instructions_str.split('\n')
            if len(steps) > 1:
                cleaned_steps = [step.strip() for step in steps if step.strip()]
                if cleaned_steps:
                    return cleaned_steps
            
            # Try splitting by periods (for continuous text)
            steps = instructions_str.split('.')
            if len(steps) > 1:
                cleaned_steps = [step.strip() + '.' for step in steps if step.strip()]
                if cleaned_steps:
                    return cleaned_steps
            
            # If all else fails, return as single step
            return [instructions_str.strip()]
            
        except Exception as e:
            logger.error(f"Error parsing instructions: {e}")
            return [str(instructions_text).strip()]

    def generate_description(self, title, cuisine, meal_type):
        """Generate description for recipes that don't have one"""
        descriptions = {
            'breakfast': [
                f"A delicious {cuisine} breakfast featuring {title}. Perfect way to start your day!",
                f"Traditional {cuisine} breakfast recipe for {title}. Energizing and flavorful!",
                f"Quick and easy {title} - a classic {cuisine} breakfast favorite."
            ],
            'lunch': [
                f"Hearty {cuisine} lunch recipe for {title}. Satisfying and nutritious!",
                f"Traditional {title} from {cuisine} cuisine. Perfect midday meal!",
                f"Flavorful {title} - a staple {cuisine} lunch dish."
            ],
            'dinner': [
                f"Comforting {cuisine} dinner featuring {title}. Perfect family meal!",
                f"Authentic {title} recipe from {cuisine} cuisine. Dinner delight!",
                f"Hearty and delicious {title} - a classic {cuisine} dinner."
            ],
            'snack': [
                f"Tasty {cuisine} snack: {title}. Perfect for any time of day!",
                f"Quick {title} snack from {cuisine} cuisine. Irresistible flavors!",
                f"Traditional {cuisine} snack recipe for {title}. Light and delicious."
            ]
        }
        
        meal_key = meal_type.lower() if meal_type else 'dinner'
        import random
        return random.choice(descriptions.get(meal_key, descriptions['dinner']))

    def get_ingredient_substitutes(self, ingredient_name):
        """Get substitutes for an ingredient from database table 'substitutes'"""
        try:
            with connection.cursor() as cursor:
                # First try exact match
                cursor.execute("""
                    SELECT s.substitute_name, s.reason 
                    FROM substitutes s
                    JOIN ingredients i ON s.ingredient_id = i.ingredient_id
                    WHERE i.ingredient_name = %s
                    LIMIT 3
                """, [ingredient_name.lower()])
                
                substitutes = cursor.fetchall()
                
                # If no exact match, try partial match
                if not substitutes:
                    cursor.execute("""
                        SELECT s.substitute_name, s.reason 
                        FROM substitutes s
                        JOIN ingredients i ON s.ingredient_id = i.ingredient_id
                        WHERE i.ingredient_name LIKE %s
                        LIMIT 3
                    """, [f'%{ingredient_name.lower()}%'])
                    
                    substitutes = cursor.fetchall()
                
                # Format the results
                formatted_substitutes = []
                for sub in substitutes:
                    formatted_substitutes.append({
                        'substitute': sub[0],
                        'reason': sub[1] or 'Good alternative ingredient'
                    })
                
                return formatted_substitutes
                
        except Exception as e:
            logger.error(f"Error fetching substitutes for {ingredient_name}: {e}")
            return []

    def find_common_substitutes(self, missing_ingredients):
        """Find substitutes for multiple missing ingredients from database"""
        substitutes_map = {}
        for ingredient in missing_ingredients:
            substitutes = self.get_ingredient_substitutes(ingredient)
            if substitutes:
                substitutes_map[ingredient] = substitutes
            else:
                # Fallback if no substitutes found in database
                substitutes_map[ingredient] = [{
                    'substitute': f'Alternative {ingredient}',
                    'reason': 'General substitution'
                }]
        return substitutes_map

    def get_recipes_with_substitutions(self, user_ingredients, top_n=5):
        """Get recipe recommendations with substitution suggestions using CORE ingredients"""
        try:
            # First, get normal recommendations (already filters by 2+ matches and >40%)
            recommendations = self.predict(user_ingredients, top_n=top_n)
            
            if not recommendations:
                return []
            
            enhanced_recommendations = []
            user_ingredients_lower = [ing.lower() for ing in user_ingredients]
            
            for recipe in recommendations:
                # Find missing ingredients for this recipe
                recipe_ingredients = recipe.get('ingredients', [])
                missing_ingredients = []
                
                for recipe_ing in recipe_ingredients:
                    has_ingredient = any(
                        self.ingredient_similarity_score(user_ing, recipe_ing) > 0.7
                        for user_ing in user_ingredients_lower
                    )
                    if not has_ingredient:
                        missing_ingredients.append(recipe_ing)
                
                # Get substitutes for missing ingredients from database
                substitutes = self.find_common_substitutes(missing_ingredients)
                
                enhanced_recipe = {
                    **recipe,
                    'missing_ingredients': missing_ingredients,
                    'substitutes': substitutes,
                    'ingredients_you_have': recipe.get('matching_ingredients', []),
                    'actual_match_percentage': recipe.get('confidence_score', 0),
                    'can_make_with_substitutes': len(missing_ingredients) <= 2
                }
                
                enhanced_recommendations.append(enhanced_recipe)
            
            return enhanced_recommendations
            
        except Exception as e:
            logger.error(f"Error getting recipes with substitutions: {e}")
            return []

    def calculate_recipe_usability(self, recipe_ingredients, user_ingredients):
        """Calculate how much of the recipe can be made with user ingredients"""
        matching_count, _ = self.find_matching_ingredients(user_ingredients, recipe_ingredients)
        
        total_ingredients = len(recipe_ingredients)
        if total_ingredients == 0:
            return 0, False
        
        usability_percentage = (matching_count / total_ingredients) * 100
        can_make = matching_count >= 2 or (total_ingredients - matching_count <= 2 and usability_percentage >= 60)
        
        return usability_percentage, can_make

    def get_detailed_substitutions(self, recipe_id, user_ingredients):
        """Get detailed substitution analysis for a specific recipe using CORE ingredients"""
        try:
            with connection.cursor() as cursor:
                # Get recipe core ingredients
                cursor.execute("""
                    SELECT GROUP_CONCAT(i.ingredient_name) as core_ingredients
                    FROM recipe_core_ingredients rci
                    JOIN ingredients i ON rci.ingredient_id = i.ingredient_id
                    WHERE rci.recipe_id = %s AND rci.is_essential = 1
                    GROUP BY rci.recipe_id
                """, [recipe_id])
                recipe_data = cursor.fetchone()
                
                if not recipe_data:
                    return None
                
                # Parse core ingredients
                recipe_ingredients = recipe_data[0].split(',') if recipe_data[0] else []
                
                # Find missing ingredients and get substitutes
                user_ingredients_lower = [ing.lower() for ing in user_ingredients]
                missing_analysis = []
                
                for recipe_ing in recipe_ingredients:
                    has_ingredient = any(
                        self.ingredient_similarity_score(user_ing, recipe_ing) > 0.7
                        for user_ing in user_ingredients_lower
                    )
                    
                    if not has_ingredient:
                        substitutes = self.get_ingredient_substitutes(recipe_ing)
                        missing_analysis.append({
                            'missing_ingredient': recipe_ing,
                            'substitutes': substitutes,
                            'substitute_count': len(substitutes)
                        })
                
                # Calculate usability
                usability_percentage, can_make = self.calculate_recipe_usability(recipe_ingredients, user_ingredients)
                
                return {
                    'missing_ingredients_analysis': missing_analysis,
                    'usability_percentage': usability_percentage,
                    'can_make': can_make,
                    'total_ingredients': len(recipe_ingredients),
                    'missing_count': len(missing_analysis),
                    'matching_count': len(recipe_ingredients) - len(missing_analysis)
                }
                
        except Exception as e:
            logger.error(f"Error getting detailed substitutions: {e}")
            return None

    def ensure_trained(self):
        """Ensure model is trained before making predictions"""
        if not self.is_trained:
            logger.info("Model not trained. Training now...")
            return self.train()
        return True


# Global instance
recipe_ml_model = RecipeMLModel()


# Main function to get recipe recommendations
def get_recipe_recommendations(user_ingredients, cuisine='All Cuisines', meal_type='All Meals', diet='All Diets'):
    """
    Main function to get recipe recommendations using CORE ingredients
    Only returns recipes with at least 2 matching ingredients AND >40% match percentage
    """
    try:
        recommendations = recipe_ml_model.predict(
            user_ingredients=user_ingredients,
            cuisine_type=cuisine,
            meal_type=meal_type,
            diet_type=diet,
            min_match_percentage=40.0
        )
        
        if recommendations:
            return {
                'success': True,
                'recommendations': recommendations,
                'count': len(recommendations),
                'message': f'Found {len(recommendations)} recipes matching at least 2 of your CORE ingredients with >40% match!'
            }
        else:
            return {
                'success': False,
                'recommendations': [],
                'count': 0,
                'message': 'No recipes found with at least 2 matching CORE ingredients and >40% match. Try adding more ingredients!'
            }
        
    except Exception as e:
        logger.error(f"Error in get_recipe_recommendations: {e}")
        return {
            'success': False,
            'recommendations': [],
            'count': 0,
            'message': 'Unable to process your request. Please try again.'
        }


def initialize_ml_model():
    """Initialize and optionally train the ML model on startup"""
    try:
        logger.info("Initializing ML model with CORE ingredients...")
        # This will trigger training when first prediction is made
        return recipe_ml_model
    except Exception as e:
        logger.error(f"Failed to initialize ML model with core ingredients: {e}")
        return None