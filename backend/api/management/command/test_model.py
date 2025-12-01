from django.core.management.base import BaseCommand
from api.ml_model import recipe_ml_model
import time

class Command(BaseCommand):
    help = 'Test the ML recipe recommendation model'

    def add_arguments(self, parser):
        parser.add_argument(
            '--ingredients',
            type=str,
            help='Comma-separated list of ingredients to test'
        )
        parser.add_argument(
            '--top-n',
            type=int,
            default=3,
            help='Number of recommendations to show (default: 3)'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 Testing ML Recipe Recommendation Model...'))
        
        # Test 1: Check database connection and data
        self.stdout.write('\n1. 📊 Checking database and recipes...')
        try:
            recipes = recipe_ml_model.fetch_recipes_from_db()
            self.stdout.write(f'   Found {len(recipes)} recipes in database')
            
            # Show sample of recipes (limit to 5 to avoid clutter)
            for recipe in recipes[:5]:
                self.stdout.write(f'   - {recipe["title"]}')
            if len(recipes) > 5:
                self.stdout.write(f'   ... and {len(recipes) - 5} more recipes')
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   ❌ Failed to fetch recipes: {e}'))
            return

        # Test 2: Train the model
        self.stdout.write('\n2. 🤖 Training ML model...')
        start_time = time.time()
        try:
            success = recipe_ml_model.train()
            training_time = time.time() - start_time
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS(f'   ✅ Model trained successfully in {training_time:.2f} seconds!')
                )
                self.stdout.write(f'   Features used: {len(recipe_ml_model.feature_columns)}')
            else:
                self.stdout.write(
                    self.style.ERROR('   ❌ Model training failed!')
                )
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   ❌ Training error: {e}'))
            return

        # Test 3: Test predictions with various ingredient combinations
        self.stdout.write('\n3. 🔍 Testing predictions...')
        
        test_cases = [
            {
                'name': 'Basic Indian Spices',
                'ingredients': ['turmeric', 'cumin', 'tomatoes', 'onions']
            },
            {
                'name': 'Dairy Ingredients', 
                'ingredients': ['milk', 'paneer', 'yogurt']
            },
            {
                'name': 'Rice & Lentils',
                'ingredients': ['basmati rice', 'lentils', 'spices']
            },
            {
                'name': 'Single Ingredient',
                'ingredients': ['chickpeas']
            }
        ]

        # Use provided ingredients if any
        if options['ingredients']:
            user_ingredients = [ing.strip() for ing in options['ingredients'].split(',')]
            test_cases = [{
                'name': 'User Provided',
                'ingredients': user_ingredients
            }]

        for test_case in test_cases:
            self.stdout.write(f'\n   🧪 Test: {test_case["name"]}')
            self.stdout.write(f'   Ingredients: {", ".join(test_case["ingredients"])}')
            
            try:
                start_time = time.time()
                recommendations = recipe_ml_model.predict(
                    test_case['ingredients'],
                    top_n=options['top_n']
                )
                prediction_time = time.time() - start_time
                
                if recommendations:
                    self.stdout.write(
                        self.style.SUCCESS(f'   ✅ Found {len(recommendations)} recommendations in {prediction_time:.2f}s')
                    )
                    for i, recipe in enumerate(recommendations, 1):
                        self.stdout.write(f'      {i}. {recipe["title"]} ({recipe["confidence_score"]}% match)')
                        self.stdout.write(f'         ⏱  {recipe["cooking_time"]} mins | 🎯 {recipe["difficulty"]} | 🍛 {recipe["cuisine"]}')
                else:
                    self.stdout.write(
                        self.style.WARNING('   ⚠  No recommendations found')
                    )
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'   ❌ Prediction error: {e}'))

        # Test 4: Model information
        self.stdout.write('\n4. 📈 Model Information:')
        self.stdout.write(f'   Is trained: {recipe_ml_model.is_trained}')
        self.stdout.write(f'   Feature count: {len(recipe_ml_model.feature_columns)}')
        self.stdout.write(f'   Available recipes: {len(recipes)}')
        
        # Show sample features
        if recipe_ml_model.feature_columns:
            self.stdout.write(f'   Sample features: {", ".join(recipe_ml_model.feature_columns[:5])}...')

        self.stdout.write(
            self.style.SUCCESS('\n🎉 ML Model testing completed successfully!')
        )