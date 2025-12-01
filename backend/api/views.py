import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.views.decorators.http import require_http_methods
import jwt
from .models import (
    Users, Ingredients, Substitutes, Recipe, RecipeIngredient,
    UserIngredient, GeneratedRecipe, Favorite, MealPlan, Profile
)
from .serializers import (
    UsersSerializer, IngredientSerializer, SubstituteSerializer,
    RecipeSerializer, RecipeIngredientSerializer, UserIngredientSerializer,
    GeneratedRecipeSerializer, FavoriteSerializer, MealPlanSerializer, ProfileSerializer
)


# ---------------------- SIGNUP ----------------------
@csrf_exempt
def signup(request):
    if request.method != 'POST':
        return JsonResponse({'message': 'Invalid method'}, status=405)
    try:
        data = json.loads(request.body.decode('utf-8'))
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        diet_preference = data.get('diet_preference', None)

        if not username or not email or not password:
            return JsonResponse({'message': 'All fields are required'}, status=400)

        hashed = make_password(password)

        with connection.cursor() as cursor:
            # Check if email already exists
            cursor.execute("SELECT user_id FROM users WHERE email = %s", [email])
            if cursor.fetchone():
                return JsonResponse({'message': 'Email already registered'}, status=400)

            # Insert user into users table
            cursor.execute(
                """
                INSERT INTO users (username, email, password, diet_preference)
                VALUES (%s, %s, %s, %s)
                """,
                [username, email, hashed, diet_preference]
            )
            connection.commit()

            # Get last inserted user ID
            cursor.execute("SELECT LAST_INSERT_ID()")
            user_id = cursor.fetchone()[0]

        return JsonResponse({'message': 'Signup successful', 'user_id': user_id}, status=201)

    except Exception as e:
        print("Signup Error:", e)
        return JsonResponse({'message': f'Server error: {e}'}, status=500)

# ---------------------- LOGIN ----------------------
@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({'message': 'Invalid method'}, status=405)
    try:
        data = json.loads(request.body.decode('utf-8'))
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return JsonResponse({'message': 'Email and password required'}, status=400)

        with connection.cursor() as cursor:
            cursor.execute("SELECT user_id, username, email, password FROM users WHERE email = %s", [email])
            row = cursor.fetchone()

        if not row:
            return JsonResponse({'message': 'User not found'}, status=404)

        user_id, username, email, hashed_password = row

        if check_password(password, hashed_password):
            return JsonResponse({
                'message': 'Login successful',
                'user': {'user_id': user_id, 'username': username, 'email': email}
            })
        else:
            return JsonResponse({'message': 'Incorrect password'}, status=401)
    except Exception as e:
        print("Login Error:", e)
        return JsonResponse({'message': f'Server error: {e}'}, status=500)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import jwt
from django.conf import settings
import json

@csrf_exempt
def verify_token(request):
    """
    Verify JWT token and return user data from MySQL database
    """
    if request.method != 'GET':
        return JsonResponse({'message': 'Invalid method'}, status=405)
    
    try:
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return JsonResponse(
                {'message': 'Invalid authorization header'}, 
                status=401
            )
        
        token = auth_header.split(' ')[1]
        
        # Decode and verify the token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        if not user_id:
            return JsonResponse(
                {'message': 'Invalid token payload'}, 
                status=401
            )

        with connection.cursor() as cursor:
            # Query user data directly from MySQL users table
            cursor.execute("""
                SELECT user_id, username, email, created_at, diet_preference 
                FROM users 
                WHERE user_id = %s
            """, [user_id])
            
            user_row = cursor.fetchone()
            
            if not user_row:
                return JsonResponse(
                    {'message': 'User not found'}, 
                    status=404
                )
            
            # Map database columns to response data
            user_data = {
                'id': user_row[0],
                'user_id': user_row[0],
                'name': user_row[1],  # username as name
                'email': user_row[2],
                'joinDate': user_row[3].isoformat() if user_row[3] else None,
                'username': user_row[1],
                'diet_preference': user_row[4]
            }
        
        return JsonResponse(user_data, status=200)
        
    except jwt.ExpiredSignatureError:
        return JsonResponse(
            {'message': 'Token has expired'}, 
            status=401
        )
    except jwt.InvalidTokenError:
        return JsonResponse(
            {'message': 'Invalid token'}, 
            status=401
        )
    except Exception as e:
        print("Verify Token Error:", e)
        return JsonResponse(
            {'message': f'Token verification failed: {str(e)}'}, 
            status=400
        )


@csrf_exempt
def get_current_user(request):
    """
    Alternative endpoint to get current user data using token
    """
    if request.method != 'GET':
        return JsonResponse({'message': 'Invalid method'}, status=405)
    
    try:
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return JsonResponse(
                {'message': 'Authorization header required'}, 
                status=401
            )
        
        token = auth_header.split(' ')[1]
        
        # Decode and verify the token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        if not user_id:
            return JsonResponse(
                {'message': 'Invalid token'}, 
                status=401
            )

        with connection.cursor() as cursor:
            # Get user data from database
            cursor.execute("""
                SELECT user_id, username, email, created_at, diet_preference 
                FROM users 
                WHERE user_id = %s
            """, [user_id])
            
            user_row = cursor.fetchone()
            
            if not user_row:
                return JsonResponse(
                    {'message': 'User not found'}, 
                    status=404
                )
            
            user_data = {
                'id': user_row[0],
                'user_id': user_row[0],
                'name': user_row[1],
                'email': user_row[2],
                'joinDate': user_row[3].isoformat() if user_row[3] else None,
                'username': user_row[1],
                'diet_preference': user_row[4]
            }
        
        return JsonResponse({
            'message': 'User data retrieved successfully',
            'user': user_data
        }, status=200)
        
    except jwt.ExpiredSignatureError:
        return JsonResponse(
            {'message': 'Token has expired'}, 
            status=401
        )
    except jwt.InvalidTokenError:
        return JsonResponse(
            {'message': 'Invalid token'}, 
            status=401
        )
    except Exception as e:
        print("Get Current User Error:", e)
        return JsonResponse(
            {'message': f'Failed to get user data: {str(e)}'}, 
            status=400
        )
# ---------------------- ADD RECIPE (expects JSON) ----------------------
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db import connection
import os
from django.conf import settings

@csrf_exempt
def add_recipe(request):
    if request.method != 'POST':
        return JsonResponse({'message': 'Invalid method'}, status=405)

    try:
        user_id = request.POST.get('user_id')
        title = request.POST.get('title')
        description = request.POST.get('description')
        ingredients = request.POST.get('ingredients')
        instructions = request.POST.get('instructions')
        cooking_time = request.POST.get('cooking_time')
        difficulty = request.POST.get('difficulty')
        cuisine = request.POST.get('cuisine')

        if not user_id or not title:
            return JsonResponse({'message': 'Missing required fields'}, status=400)

        # Handle image manually
        image_file = request.FILES.get('image_url')
        image_url = None
        if image_file:
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, image_file.name)

            with open(file_path, 'wb+') as destination:
                for chunk in image_file.chunks():
                    destination.write(chunk)

            image_url = f"{settings.MEDIA_URL}uploads/{image_file.name}"

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO recipes
                (title, description, ingredients, instructions, cooking_time,
                 difficulty, cuisine, image_url, user_id, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """, [
                title, description, ingredients, instructions, cooking_time,
                difficulty, cuisine, image_url, user_id
            ])
            connection.commit()
            cursor.execute("SELECT LAST_INSERT_ID()")
            recipe_id = cursor.fetchone()[0]

        return JsonResponse({'message': 'Recipe added successfully', 'recipe_id': recipe_id}, status=201)

    except Exception as e:
        print("Add Recipe Error:", e)
        return JsonResponse({'message': f'Failed to add recipe: {e}'}, status=500)



# ---------------------- LIST RECIPES ----------------------
@csrf_exempt
def list_recipes(request):
    if request.method == "GET":
        try:
            print("🔍 list_recipes called")
            
            # Use exact field names from your database
            recipes_data = Recipe.objects.all().values(
                "recipe_id",
                "title", 
                "description",
                "ingredients",
                "instructions", 
                "cooking_time",  # ← This matches your database column
                "difficulty",
                "cuisine",
                "image_url",
                "user_id",
                "created_at",
            )
            
            recipe_list = list(recipes_data)
            print(f"✅ Found {len(recipe_list)} recipes")
            
            # Process data
            for recipe in recipe_list:
                if not recipe.get('image_url'):
                    recipe['image_url'] = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
            
            return JsonResponse(recipe_list, safe=False, status=200)
            
        except Exception as e:
            print("❌ Error:", e)
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)
#---------------------- GET INGREDIENTS ----------------------
@api_view(['GET'])
def get_ingredients(request):
    try:
        ing = Ingredients.objects.all()
        serializer = IngredientSerializer(ing, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------- GET SUBSTITUTES ----------------------
@csrf_exempt
def get_substitutes(request, ingredient_name):
    if request.method == "GET":
        try:
            # Search for ingredient by name
            ingredient = Ingredients.objects.filter(
                ingredient_name__icontains=ingredient_name
            ).first()
            
            if not ingredient:
                return JsonResponse([], safe=False, status=200)
            
            # Get substitutes for this ingredient
            substitutes = Substitutes.objects.filter(
                ingredient_id=ingredient.ingredient_id
            ).values('substitute_id', 'ingredient_id', 'substitute_name', 'reason')
            
            substitute_list = list(substitutes)
            return JsonResponse(substitute_list, safe=False, status=200)
            
        except Exception as e:
            print("Error in get_substitutes:", e)
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)


# ---------------------- GET USER PROFILE ----------------------

@api_view(['GET'])
def get_user_profile(request, user_id):
    try:
        user = Users.objects.filter(user_id=user_id).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        user_ings = UserIngredient.objects.filter(user=user).select_related('ingredient')
        ingredients = [{'ingredient_name': ui.ingredient.ingredient_name, 'available_quantity': ui.available_quantity, 'unit': ui.unit} for ui in user_ings]

        saved_recipes = Recipe.objects.all()[:6]
        saved_recipes_serialized = RecipeSerializer(saved_recipes, many=True).data

        subs = Substitutes.objects.select_related('ingredient').all()[:10]
        substitutes = [{'ingredient': s.ingredient.ingredient_name, 'substitute': s.substitute_name, 'reason': s.reason} for s in subs]

        resp = {
            'username': user.username,
            'email': user.email,
            'diet_preference': user.diet_preference,
            'ingredients': ingredients,
            'recipes': saved_recipes_serialized,
            'substitutes': substitutes
        }
        return Response(resp, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from .models import Recipe
import json
import logging

# Set up logging
logger = logging.getLogger(__name__)

@require_GET
@csrf_exempt
def get_recipe_details(request, recipe_id):
    """
    Get detailed information for a specific recipe with comprehensive error handling
    """
    try:
        logger.info(f"Fetching details for recipe ID: {recipe_id}")
        
        # Validate recipe_id
        if not recipe_id or recipe_id <= 0:
            return JsonResponse({
                'success': False,
                'error': 'Invalid recipe ID'
            }, status=400)

        # Get the recipe from database
        try:
            recipe = Recipe.objects.get(recipe_id=recipe_id)
        except Recipe.DoesNotExist:
            logger.warning(f"Recipe with ID {recipe_id} not found")
            return JsonResponse({
                'success': False,
                'error': f'Recipe with ID {recipe_id} not found'
            }, status=404)
        except Exception as db_error:
            logger.error(f"Database error for recipe ID {recipe_id}: {str(db_error)}")
            return JsonResponse({
                'success': False,
                'error': 'Database error occurred'
            }, status=500)

        logger.info(f"Found recipe: {recipe.title} (ID: {recipe.recipe_id})")

        def parse_ingredients(ingredients_data):
            """Helper function to parse ingredients data"""
            if not ingredients_data:
                return ["Ingredients not specified"]
            
            if isinstance(ingredients_data, list):
                return [str(item).strip() for item in ingredients_data if str(item).strip()]
            
            if isinstance(ingredients_data, str):
                try:
                    parsed = json.loads(ingredients_data)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                    elif isinstance(parsed, dict):
                        return [f"{key}: {value}" for key, value in parsed.items() if str(value).strip()]
                except json.JSONDecodeError:
                    # Try to split by common separators
                    separators = [',', ';', '\n', '- ']
                    for separator in separators:
                        if separator in ingredients_data:
                            return [ing.strip() for ing in ingredients_data.split(separator) if ing.strip()]
                    return [ingredients_data.strip()]
            
            return ["Ingredients format not recognized"]

        def parse_instructions(instructions_data):
            """Helper function to parse instructions data"""
            if not instructions_data:
                return ["No instructions available"]
            
            if isinstance(instructions_data, list):
                return [str(step).strip() for step in instructions_data if str(step).strip()]
            
            if isinstance(instructions_data, str):
                try:
                    parsed = json.loads(instructions_data)
                    if isinstance(parsed, list):
                        return [str(step).strip() for step in parsed if str(step).strip()]
                except json.JSONDecodeError:
                    # Split by common step indicators
                    import re
                    steps = re.split(r'\d+\.|\n-|\n•|\n\d+\)|\nStep \d+', instructions_data)
                    steps = [step.strip() for step in steps if step.strip() and len(step.strip()) > 10]
                    if steps:
                        return steps
                    # If no clear steps found, split by newlines
                    return [step.strip() for step in instructions_data.split('\n') if step.strip()]
            
            return ["Instructions format not recognized"]

        # Parse ingredients and instructions
        ingredients = parse_ingredients(recipe.ingredients)
        instructions = parse_instructions(recipe.instructions)

        # Build comprehensive recipe data
        recipe_data = {
            'recipe_id': recipe.recipe_id,
            'title': recipe.title or 'Delicious Recipe',
            'description': recipe.description or f'A delicious {recipe.cuisine or "Indian"} recipe.',
            'ingredients': ingredients,
            'instructions': instructions,
            'cooking_time': recipe.cooking_time or 30,
            'difficulty': recipe.difficulty or 'Medium',
            'cuisine': recipe.cuisine or 'Indian',
            'image_url': recipe.image_url or '',
            'user_id': recipe.user_id,
            'created_at': recipe.created_at.isoformat() if recipe.created_at else None,
            # Additional fields that might be useful
            'prep_time': getattr(recipe, 'prep_time', None),  # If you have prep_time field
            'servings': getattr(recipe, 'servings', 4),       # If you have servings field
        }

        logger.info(f"Successfully prepared recipe data: {recipe_data['title']}")
        logger.info(f" - {len(ingredients)} ingredients, {len(instructions)} instructions")

        return JsonResponse({
            'success': True,
            'recipe': recipe_data,
            'message': f'Recipe details for {recipe_data["title"]}'
        })

    except Exception as e:
        logger.error(f"Unexpected error in get_recipe_details for recipe {recipe_id}: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'An unexpected error occurred while fetching recipe details'
        }, status=500)
# ---------------------- SAVE GENERATED RECIPE ----------------------
@csrf_exempt
def save_generated_recipe(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid method'}, status=405)
    try:
        data = json.loads(request.body.decode('utf-8'))
        user_id = data.get('user_id')
        notes = data.get('notes', '')
        recipe_id = data.get('recipe_id', None)

        user = Users.objects.filter(user_id=user_id).first()
        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)

        generated = GeneratedRecipe.objects.create(user=user, recipe_id=recipe_id, notes=notes)
        return JsonResponse({'message': 'Generated recipe saved', 'generated_id': generated.id}, status=201)
    except Exception as e:
        print("Save Generated Error:", e)
        return JsonResponse({'error': str(e)}, status=500)


# ---------------------- FAVORITES ----------------------
@api_view(['GET'])
def list_favorites(request, user_id):
    try:
        favs = Favorite.objects.filter(user__user_id=user_id).select_related('recipe')
        serializer = FavoriteSerializer(favs, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def add_favorite(request):
    try:
        user_id = request.data.get('user_id')
        recipe_id = request.data.get('recipe_id')
        user = Users.objects.filter(user_id=user_id).first()
        recipe = Recipe.objects.filter(recipe_id=recipe_id).first()
        if not user or not recipe:
            return Response({'error': 'User or Recipe not found'}, status=status.HTTP_404_NOT_FOUND)

        fav, created = Favorite.objects.get_or_create(user=user, recipe=recipe)
        if not created:
            return Response({'message': 'Already favorited'}, status=status.HTTP_200_OK)
        return Response({'message': 'Favorited'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def remove_favorite(request, user_id, recipe_id):
    try:
        fav = Favorite.objects.filter(user__user_id=user_id, recipe__recipe_id=recipe_id).first()
        if not fav:
            return Response({'error': 'Favorite not found'}, status=status.HTTP_404_NOT_FOUND)
        fav.delete()
        return Response({'message': 'Favorite removed'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# views.py - Add this endpoint
# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import connection
import json

@csrf_exempt
@require_http_methods(["PUT"])
def update_user_profile(request, user_id):
    try:
        # Parse request data
        data = json.loads(request.body)
        name = data.get('name')
        email = data.get('email')
        
        print(f"Updating user {user_id} with: name={name}, email={email}")
        
        # Build the update query
        update_fields = []
        params = []
        
        if name:
            update_fields.append("username = %s")  # Using username field for name
            params.append(name)
        
        if email:
            update_fields.append("email = %s")
            params.append(email)
        
        # If no fields to update, return early
        if not update_fields:
            return JsonResponse({'error': 'No fields to update'}, status=400)
        
        # Add user_id to params for WHERE clause
        params.append(user_id)
        
        # Execute the update query
        with connection.cursor() as cursor:
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE user_id = %s"
            cursor.execute(query, params)
            
            # Fetch the updated user data
            cursor.execute("""
                SELECT user_id, username, email, created_at
                FROM users
                WHERE user_id = %s
            """, [user_id])
            
            row = cursor.fetchone()
            
            if row:
                user_data = {
                    'user_id': row[0],
                    'name': row[1],  # Map username to name for frontend
                    'email': row[2],
                    'joinDate': row[3].isoformat() if row[3] else None,
                }
                print(f"User updated successfully: {user_data}")
                return JsonResponse(user_data)
            else:
                return JsonResponse({'error': 'User not found after update'}, status=404)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['PUT'])
def update_profile(request, user_id):
    try:
        # Get the user
        user = User.objects.get(id=user_id)
        
        # Get data from request
        username = request.data.get('username')
        email = request.data.get('email')
        
        # Update user fields
        if username:
            user.username = username
        if email:
            user.email = email
        
        user.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
# ---------------------- MEALPLANS ----------------------
@api_view(['GET'])
def list_mealplans(request, user_id):
    try:
        plans = MealPlan.objects.filter(user__user_id=user_id)
        serializer = MealPlanSerializer(plans, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def create_mealplan(request):
    try:
        user_id = request.data.get('user_id')
        user = Users.objects.filter(user_id=user_id).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        plan = MealPlan.objects.create(
            user=user,
            name=request.data.get('name'),
            description=request.data.get('description', ''),
            meals=request.data.get('meals', 0),
            duration=request.data.get('duration', ''),
            status=request.data.get('status', 'Active')
        )
        return Response(MealPlanSerializer(plan).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
def update_mealplan(request, plan_id):
    try:
        plan = MealPlan.objects.filter(id=plan_id).first()
        if not plan:
            return Response({'error': 'MealPlan not found'}, status=status.HTTP_404_NOT_FOUND)
        data = request.data
        plan.name = data.get('name', plan.name)
        plan.description = data.get('description', plan.description)
        plan.meals = int(data.get('meals', plan.meals or 0))
        plan.duration = data.get('duration', plan.duration)
        plan.status = data.get('status', plan.status)
        plan.save()
        return Response(MealPlanSerializer(plan).data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def delete_mealplan(request, plan_id):
    try:
        plan = MealPlan.objects.filter(id=plan_id).first()
        if not plan:
            return Response({'error': 'MealPlan not found'}, status=status.HTTP_404_NOT_FOUND)
        plan.delete()
        return Response({'message': 'MealPlan deleted'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------- RECIPE CRUD (basic) ----------------------
@api_view(['PUT', 'PATCH'])
def update_recipe(request, recipe_id):
    try:
        recipe = Recipe.objects.filter(recipe_id=recipe_id).first()
        if not recipe:
            return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RecipeSerializer(recipe, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def delete_recipe(request, recipe_id):
    try:
        recipe = Recipe.objects.filter(recipe_id=recipe_id).first()
        if not recipe:
            return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
        recipe.delete()
        return Response({'message': 'Recipe deleted successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


import json
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
def send_recipes(request):
    try:
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get 5 random recipes
        recipes = get_random_recipes(5)
        
        if not recipes:
            return Response({'error': 'No recipes found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Send email
        send_recipes_email(email, recipes)
        
        return Response({
            'message': 'Success! Check your email for 5 delicious recipes.'
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return Response({'error': 'Server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_random_recipes(limit=5):
    """Get random recipes from database"""
    try:
        with connection.cursor() as cursor:
            cursor.execute(f"""
                SELECT recipe_id, title, description, ingredients, instructions, 
                       cooking_time, difficulty, cuisine, image_url, serving_size
                FROM recipes 
                ORDER BY RAND() 
                LIMIT {limit}
            """)
            # ... rest of your existing code
            
            columns = [col[0] for col in cursor.description]
            recipes = []
            
            for row in cursor.fetchall():
                recipe_dict = dict(zip(columns, row))
                
                # Parse ingredients
                try:
                    if recipe_dict['ingredients']:
                        recipe_dict['ingredients_list'] = json.loads(recipe_dict['ingredients'])
                    else:
                        recipe_dict['ingredients_list'] = []
                except:
                    recipe_dict['ingredients_list'] = []
                
                # Parse instructions
                try:
                    if recipe_dict['instructions']:
                        instructions = json.loads(recipe_dict['instructions'])
                        recipe_dict['instructions_list'] = [step for step in instructions if step.strip()]
                    else:
                        recipe_dict['instructions_list'] = []
                except:
                    recipe_dict['instructions_list'] = []
                
                recipes.append(recipe_dict)
            
            return recipes
            
    except Exception as e:
        print(f"Database error: {str(e)}")
        return []

def send_recipes_email(email, recipes):
    """Send recipes to email with HTML including images"""
    try:
        subject = f"🎁 Your {len(recipes)} COOKMATE Recipes"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }}
                .recipe {{ border: 1px solid #e0e0e0; padding: 20px; margin: 20px 0; border-radius: 10px; background: #f9f9f9; }}
                .recipe-title {{ color: #2c5530; font-size: 20px; margin-bottom: 10px; }}
                .recipe-meta {{ color: #666; font-size: 14px; margin-bottom: 10px; }}
                .recipe-image {{ max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🍳 COOKMATE Recipes</h1>
                <p>Your instant recipe collection is here!</p>
            </div>
            
            <h2>Hello Food Lover! 👋</h2>
            <p>Here are <strong>{len(recipes)} delicious recipes</strong> from our collection:</p>
        """
        
        for recipe in recipes:
            # Add image if available
            image_html = ""
            if recipe.get('image_url'):
                image_html = f'<img src="{recipe["image_url"]}" alt="{recipe["title"]}" class="recipe-image" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px;">'
            
            html_content += f"""
            <div class="recipe">
                {image_html}
                <div class="recipe-title">{recipe['title']}</div>
                <div class="recipe-meta">
                    ⏱️ {recipe['cooking_time']} min | 🍽️ {recipe['serving_size']} servings | 
                    📊 {recipe['difficulty']} | 📍 {recipe['cuisine']}
                </div>
                <p><strong>Description:</strong> {recipe['description']}</p>
                
                <h4>🛒 Ingredients:</h4>
                <ul>
                    {"".join([f"<li>{ingredient}</li>" for ingredient in recipe['ingredients_list']])}
                </ul>
                
                <h4>👨‍🍳 Instructions:</h4>
                <ol>
                    {"".join([f"<li>{step}</li>" for step in recipe['instructions_list'][:3]])}
                </ol>
            </div>
            """
        
        html_content += """
            <p style="text-align: center; margin-top: 30px;">Happy cooking! 🍳</p>
            </body>
            </html>
        """
        
        # Send email with HTML
        from django.core.mail import EmailMultiAlternatives
        email_msg = EmailMultiAlternatives(
            subject=subject,
            body="Please view this email in an HTML-enabled client to see images and formatting.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        email_msg.attach_alternative(html_content, "text/html")
        email_msg.send()
        
        print(f"Email sent successfully to {email}")
        
    except Exception as e:
        print(f"Email error: {str(e)}")
        raise e
    
@api_view(['POST'])
def send_welcome_email(request):
    """Send welcome email to new users after signup"""
    try:
        email = request.data.get('email')
        username = request.data.get('username')
        
        if not email or not username:
            return Response({'error': 'Email and username required'}, status=400)
        
        subject = "🎉 Welcome to COOKMATE - Let's Start Cooking!"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }}
                .content {{ padding: 20px; }}
                .feature {{ margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Welcome to COOKMATE, {username}! 🍳</h1>
                <p>Your culinary journey begins now</p>
            </div>
            
            <div class="content">
                <h2>Hello {username},</h2>
                <p>We're thrilled to have you join our community of food lovers! Here's what you can do now:</p>
                
                <div class="feature">
                    <h3>🔍 Discover Recipes</h3>
                    <p>Explore thousands of recipes from Indian classics to international favorites.</p>
                </div>
                
                <div class="feature">
                    <h3>📝 Save Favorites</h3>
                    <p>Bookmark your favorite recipes and create personalized collections.</p>
                </div>
                
                <div class="feature">
                    <h3>👨‍🍳 Share Creations</h3>
                    <p>Upload your own recipes and share your culinary creations with the community.</p>
                </div>
                
                
                <p><strong>Ready to start cooking?</strong></p>
                <p>Head over to your dashboard and explore the amazing features we've prepared for you.</p>
                
                <p>Happy Cooking!<br>The COOKMATE Team 🍽️</p>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
        Welcome to COOKMATE, {username}!
        
        We're thrilled to have you join our community of food lovers!
        
        Here's what you can do now:
        • Discover thousands of recipes
        • Save your favorite dishes
        • Share your own creations
        
        Ready to start cooking? Log in to your account and explore!
        
        Happy Cooking!
        The COOKMATE Team
        """
        
        email_msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        email_msg.attach_alternative(html_content, "text/html")
        email_msg.send()
        
        return Response({'message': 'Welcome email sent successfully'})
        
    except Exception as e:
        print(f"Welcome email error: {str(e)}")
        return Response({'error': 'Failed to send welcome email'}, status=500)
from django.shortcuts import render
from django.http import JsonResponse
import json

def ml_test_page(request):
    """Serve the ML test HTML page"""
    return render(request, 'ml_test.html')

def get_ml_model_status(request):
    """Check ML model status"""
    try:
        from .ml_model import recipe_ml_model
        
        recipes = recipe_ml_model.fetch_recipes_from_db()
        
        return JsonResponse({
            'success': True,
            'is_trained': recipe_ml_model.is_trained,
            'recipe_count': len(recipes),
            'feature_count': len(recipe_ml_model.feature_columns) if recipe_ml_model.is_trained else 0
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

def train_ml_model(request):
    """Train the ML model"""
    try:
        from .ml_model import recipe_ml_model
        
        success = recipe_ml_model.train()
        
        return JsonResponse({
            'success': success,
            'message': 'Model trained successfully' if success else 'Training failed'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

def ml_recommend_recipes(request):
    """Get recipe recommendations"""
    try:
        data = json.loads(request.body)
        ingredients = data.get('ingredients', [])
        top_n = data.get('top_n', 5)
        
        from .ml_model import recipe_ml_model
        
        recommendations = recipe_ml_model.predict(ingredients, top_n=top_n)
        
        return JsonResponse({
            'success': True,
            'recommendations': recommendations,
            'count': len(recommendations)
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

def ml_recommend_with_substitutions(request):
    """Get recipe recommendations with ingredient substitutions"""
    try:
        data = json.loads(request.body)
        ingredients = data.get('ingredients', [])
        top_n = data.get('top_n', 5)
        
        from .ml_model import recipe_ml_model
        
        # Get enhanced recommendations with substitutions
        recommendations = recipe_ml_model.get_recipes_with_substitutions(
            ingredients, top_n=top_n
        )
        
        return JsonResponse({
            'success': True,
            'recommendations': recommendations,
            'count': len(recommendations)
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })
# api/views.py - Add these imports at the top
import json
import logging
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import connection

# Configure logger
logger = logging.getLogger(__name__)

# Add these ML functions to your existing views.py

@csrf_exempt
def get_ml_model_status(request):
    """Check ML model status"""
    try:
        from .ml_model import recipe_ml_model
        
        recipes = recipe_ml_model.fetch_recipes_from_db()
        
        return JsonResponse({
            'success': True,
            'is_trained': recipe_ml_model.is_trained,
            'recipe_count': len(recipes),
            'feature_count': len(recipe_ml_model.feature_columns) if recipe_ml_model.feature_columns else 0,
            'message': f'Model ready with {len(recipes)} recipes'
        })
    except Exception as e:
        logger.error(f"ML status error: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@csrf_exempt
def train_ml_model(request):
    """Train the ML model"""
    try:
        from .ml_model import recipe_ml_model
        
        success = recipe_ml_model.train()
        
        if success:
            return JsonResponse({
                'success': True,
                'message': f'Model trained successfully with {len(recipe_ml_model.feature_columns)} features'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Training failed - not enough data'
            })
    except Exception as e:
        logger.error(f"ML training error: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

def generate_fallback_image(recipe_name):
    """Generate appropriate fallback image based on recipe name"""
    name_lower = recipe_name.lower()
    
    if any(word in name_lower for word in ['chicken', 'fish', 'mutton', 'egg']):
        return "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400"
    elif any(word in name_lower for word in ['rice', 'biryani', 'pulao']):
        return "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400"
    elif any(word in name_lower for word in ['vegetable', 'aloo', 'palak', 'dal']):
        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
    elif any(word in name_lower for word in ['bread', 'roti', 'naan']):
        return "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400"
    else:
        return "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"

@csrf_exempt
def ml_recommend_recipes(request):
    """Get recipe recommendations - FIXED VERSION"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method allowed'})
    
    try:
        data = json.loads(request.body)
        ingredients = data.get('ingredients', [])
        top_n = data.get('top_n', 5)
        
        if not ingredients:
            return JsonResponse({
                'success': False,
                'error': 'No ingredients provided'
            })
        
        from .ml_model import recipe_ml_model
        
        # Ensure model is trained
        if not recipe_ml_model.is_trained:
            logger.info("Model not trained, training now...")
            if not recipe_ml_model.train():
                return JsonResponse({
                    'success': False,
                    'error': 'Failed to train model with available recipes'
                })
        
        recommendations = recipe_ml_model.predict(ingredients, top_n=top_n)
        
        # Transform to React-compatible format
        transformed_recommendations = []
        for i, recipe in enumerate(recommendations):
            # Generate fallback image based on recipe name
            image_url = recipe.get('image_url') or generate_fallback_image(recipe.get('title', ''))
            
            transformed_recipe = {
                'id': recipe.get('recipe_id', i + 1),
                'name': recipe.get('title', 'Unknown Recipe'),
                'image': image_url,
                'time': f"{recipe.get('cooking_time', 30)} mins",
                'rating': float(recipe.get('rating', 4.5)),
                'difficulty': recipe.get('difficulty', 'Medium'),
                'cuisine': recipe.get('cuisine', 'Indian'),
                'description': recipe.get('description', 'Delicious recipe perfect for any occasion.'),
                'ingredients': recipe.get('ingredients', []),
                'instructions': recipe.get('instructions', ['No instructions available.']),
                'match_percentage': round(recipe.get('confidence_score', 0)),
                'has_substitutions': False,
                'ingredients_you_have': recipe.get('matching_ingredients', [])
            }
            transformed_recommendations.append(transformed_recipe)
        
        logger.info(f"Generated {len(transformed_recommendations)} recommendations for ingredients: {ingredients}")
        
        return JsonResponse({
            'success': True,
            'recommendations': transformed_recommendations,
            'count': len(transformed_recommendations),
            'message': f'Found {len(transformed_recommendations)} recipes matching your ingredients!'
        })
        
    except Exception as e:
        logger.error(f"ML recommendation error: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@csrf_exempt
def ml_recommend_with_substitutions(request):
    """Get recipe recommendations with ingredient substitutions - FIXED VERSION"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method allowed'})
    
    try:
        data = json.loads(request.body)
        ingredients = data.get('ingredients', [])
        top_n = data.get('top_n', 5)
        
        if not ingredients:
            return JsonResponse({
                'success': False,
                'error': 'No ingredients provided'
            })
        
        from .ml_model import recipe_ml_model
        
        # Ensure model is trained
        if not recipe_ml_model.is_trained:
            logger.info("Model not trained, training now...")
            if not recipe_ml_model.train():
                return JsonResponse({
                    'success': False,
                    'error': 'Failed to train model with available recipes'
                })
        
        # Get enhanced recommendations with substitutions
        recommendations = recipe_ml_model.get_recipes_with_substitutions(ingredients, top_n=top_n)
        
        # Transform to React-compatible format
        transformed_recommendations = []
        for i, recipe in enumerate(recommendations):
            # Generate fallback image based on recipe name
            image_url = recipe.get('image_url') or generate_fallback_image(recipe.get('title', ''))
            
            transformed_recipe = {
                'id': recipe.get('recipe_id', i + 1),
                'name': recipe.get('title', 'Unknown Recipe'),
                'image': image_url,
                'time': f"{recipe.get('cooking_time', 30)} mins",
                'rating': float(recipe.get('rating', 4.5)),
                'difficulty': recipe.get('difficulty', 'Medium'),
                'cuisine': recipe.get('cuisine', 'Indian'),
                'description': recipe.get('description', 'Delicious recipe perfect for any occasion.'),
                'ingredients': recipe.get('ingredients', []),
                'instructions': recipe.get('instructions', ['No instructions available.']),
                'match_percentage': round(recipe.get('actual_match_percentage', recipe.get('confidence_score', 0))),
                'has_substitutions': True,
                'missing_ingredients': recipe.get('missing_ingredients', []),
                'substitutes': recipe.get('substitutes', {}),
                'ingredients_you_have': recipe.get('ingredients_you_have', []),
                'can_make_with_substitutes': recipe.get('can_make_with_substitutes', False)
            }
            transformed_recommendations.append(transformed_recipe)
        
        logger.info(f"Generated {len(transformed_recommendations)} substitution recommendations for ingredients: {ingredients}")
        
        return JsonResponse({
            'success': True,
            'recommendations': transformed_recommendations,
            'count': len(transformed_recommendations),
            'message': f'Found {len(transformed_recommendations)} recipes with substitution options!'
        })
        
    except Exception as e:
        logger.error(f"ML substitution recommendation error: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        })
# Add these new views to your api/views.py

@csrf_exempt
def get_recipe_details(request, recipe_id):
    """Get complete recipe details including instructions and ingredients"""
    try:
        from .ml_model import recipe_ml_model
        
        with connection.cursor() as cursor:
            # Get complete recipe details
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
                r.created_at
            FROM recipes r
            WHERE r.recipe_id = %s
            """
            cursor.execute(query, [recipe_id])
            recipe = cursor.fetchone()
            
            if not recipe:
                return JsonResponse({
                    'success': False,
                    'error': 'Recipe not found'
                })
            
            # Get structured ingredients with quantities
            cursor.execute("""
                SELECT 
                    i.ingredient_name,
                    ri.quantity,
                    ri.unit
                FROM recipe_ingredients ri
                JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
                WHERE ri.recipe_id = %s
            """, [recipe_id])
            structured_ingredients = cursor.fetchall()
            
            # Parse instructions into steps
            instructions = recipe_ml_model.parse_instructions(recipe[7])
            
            recipe_details = {
                'id': recipe[0],
                'name': recipe[1],
                'description': recipe[2] or 'A delicious recipe',
                'cuisine': recipe[3] or 'Indian',
                'difficulty': recipe[4] or 'Medium',
                'cooking_time': recipe[5] or 30,
                'ingredients': recipe_ml_model.parse_ingredients(recipe[6]),
                'structured_ingredients': [
                    {
                        'name': ing[0],
                        'quantity': float(ing[1]) if ing[1] else None,
                        'unit': ing[2]
                    } for ing in structured_ingredients
                ],
                'instructions': instructions,
                'image_url': recipe[8] or recipe_ml_model.generate_fallback_image(recipe[1]),
                'meal_type': recipe[9] or 'Dinner',
                'diet_type': recipe[10] or 'Vegetarian',
                'serving_size': recipe[11] or 4,
                'rating': float(recipe[12]) if recipe[12] else 4.5,
                'created_at': recipe[13].isoformat() if recipe[13] else None
            }
            
            return JsonResponse({
                'success': True,
                'recipe': recipe_details
            })
            
    except Exception as e:
        logger.error(f"Error fetching recipe details: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@csrf_exempt
def get_recipe_substitutions(request, recipe_id):
    """Get substitution suggestions for a specific recipe based on user ingredients"""
    try:
        data = json.loads(request.body)
        user_ingredients = data.get('user_ingredients', [])
        
        from .ml_model import recipe_ml_model
        
        # Get recipe details
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT r.ingredients, GROUP_CONCAT(i.ingredient_name) as structured_ingredients
                FROM recipes r
                LEFT JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
                LEFT JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
                WHERE r.recipe_id = %s
                GROUP BY r.recipe_id
            """, [recipe_id])
            recipe_data = cursor.fetchone()
            
            if not recipe_data:
                return JsonResponse({
                    'success': False,
                    'error': 'Recipe not found'
                })
        
        # Parse recipe ingredients
        recipe_ingredients = recipe_ml_model.parse_ingredients(
            recipe_data[0], 
            recipe_data[1]
        )
        
        # Find missing ingredients
        user_ingredients_lower = [ing.lower() for ing in user_ingredients]
        missing_ingredients = []
        
        for recipe_ing in recipe_ingredients:
            recipe_ing_lower = recipe_ing.lower()
            has_ingredient = any(
                user_ing in recipe_ing_lower or recipe_ing_lower in user_ing 
                for user_ing in user_ingredients_lower
            )
            if not has_ingredient:
                missing_ingredients.append(recipe_ing)
        
        # Get substitutes for missing ingredients
        substitutes = recipe_ml_model.find_common_substitutes(missing_ingredients)
        
        # Calculate usability score
        total_ingredients = len(recipe_ingredients)
        missing_count = len(missing_ingredients)
        usability_score = ((total_ingredients - missing_count) / total_ingredients) * 100
        
        can_make = missing_count == 0 or (missing_count <= 2 and usability_score >= 70)
        
        return JsonResponse({
            'success': True,
            'missing_ingredients': missing_ingredients,
            'substitutes': substitutes,
            'usability_score': round(usability_score),
            'can_make': can_make,
            'total_ingredients': total_ingredients,
            'missing_count': missing_count,
            'user_ingredients_count': len(user_ingredients),
            'message': f"You have {len(user_ingredients)} of {total_ingredients} ingredients ({usability_score}%)"
        })
        
    except Exception as e:
        logger.error(f"Error getting substitutions: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

# Keep all your existing views below...
# Add to your existing views.py

@csrf_exempt
def evaluate_model_performance(request):
    """API endpoint to evaluate and return model performance metrics"""
    if request.method == 'GET':
        try:
            from .evaluate_model import run_evaluation
            
            result = run_evaluation()
            
            if result['success']:
                response_data = {
                    'success': True,
                    'performance': {
                        'accuracy': result['results']['accuracy'],
                        'precision': result['results']['precision'],
                        'recall': result['results']['recall'],
                        'f1_score': result['results']['f1_score'],
                    },
                    'cross_validation': result['results'].get('cross_validation', {}),
                    'dataset_info': {
                        'test_set_size': result['results']['test_set_size'],
                        'unique_classes': result['results']['unique_classes']
                    },
                    'model_health': result['report'].get('model_health', 'UNKNOWN'),
                    'recommendations': result['report'].get('recommendations', [])
                }
                
                # Add relative paths for frontend
                if 'plots' in result:
                    for plot_name, plot_path in result['plots'].items():
                        if plot_path:
                            response_data[f'{plot_name}_url'] = '/media/' + os.path.basename(plot_path)
                
                return JsonResponse(response_data)
            else:
                return JsonResponse({
                    'success': False,
                    'error': result.get('error', 'Evaluation failed')
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })

@csrf_exempt
def get_model_metrics(request):
    """Quick endpoint to get basic model metrics without full evaluation"""
    if request.method == 'GET':
        try:
            from .ml_model import recipe_ml_model
            
            return JsonResponse({
                'success': True,
                'model_status': {
                    'is_trained': recipe_ml_model.is_trained,
                    'recipes_count': len(recipe_ml_model.all_recipes),
                    'feature_count': len(recipe_ml_model.feature_columns) if recipe_ml_model.feature_columns else 0
                }
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })