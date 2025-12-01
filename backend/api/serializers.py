from rest_framework import serializers
from .models import (
    Users, Ingredients, Substitutes, Recipe, RecipeIngredient,
    UserIngredient, GeneratedRecipe, Favorite, MealPlan, Profile
)

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredients
        fields = '__all__'


class SubstituteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Substitutes
        fields = '__all__'


class RecipeIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = '__all__'


class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = '__all__'


class UserIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserIngredient
        fields = '__all__'


class GeneratedRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedRecipe
        fields = '__all__'


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = '__all__'


class MealPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPlan
        fields = '__all__'
