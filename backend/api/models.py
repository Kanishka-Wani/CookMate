from django.db import models

# -------------------------
# Map to your existing MySQL tables
# -------------------------
class Users(models.Model):
    user_id = models.AutoField(primary_key=True)        # if your user primary key is user_id
    username = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    diet_preference = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'users'
        managed = False

    def __str__(self):
        return self.username


class Profile(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(Users, on_delete=models.CASCADE, db_column='user_id', related_name='profile')
    diet_preference = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'profile'  # if your profile table is named differently change it
        managed = False

    def __str__(self):
        return str(self.user)


class Ingredients(models.Model):
    ingredient_id = models.AutoField(primary_key=True)
    ingredient_name = models.CharField(max_length=200)
    unit = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'ingredients'
        managed = False

    def __str__(self):
        return self.ingredient_name


class Substitutes(models.Model):
    substitute_id = models.AutoField(primary_key=True)
    ingredient = models.ForeignKey(Ingredients, on_delete=models.CASCADE, db_column='ingredient_id', related_name='substitutes')
    substitute_name = models.CharField(max_length=200)
    reason = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'substitutes'
        managed = False

    def __str__(self):
        return f"{self.substitute_name} for {self.ingredient.ingredient_name}"


class Recipe(models.Model):
    recipe_id = models.AutoField(primary_key=True)
    # link to Users.user_id (db column user_id)
    user = models.ForeignKey(Users, on_delete=models.CASCADE, db_column='user_id', related_name='recipes')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    ingredients = models.JSONField(blank=True, null=True)    # store list or JSON text
    instructions = models.JSONField(blank=True, null=True)
    cooking_time = models.IntegerField(null=True, blank=True)
    servings = models.IntegerField(null=True, blank=True)
    cuisine = models.CharField(max_length=100, null=True, blank=True)
    meal_type = models.CharField(max_length=100, null=True, blank=True)
    diet_type = models.CharField(max_length=100, null=True, blank=True)
    difficulty = models.CharField(max_length=50, null=True, blank=True)
    tags = models.JSONField(blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'recipes'
        managed = False

    def __str__(self):
        return self.name


class RecipeIngredient(models.Model):
    id = models.AutoField(primary_key=True)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, db_column='recipe_id', related_name='recipe_ingredients')
    ingredient = models.ForeignKey(Ingredients, on_delete=models.CASCADE, db_column='ingredient_id')
    quantity = models.FloatField(null=True, blank=True)
    unit = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'recipe_ingredients'
        managed = False

    def __str__(self):
        return f"{self.ingredient} for {self.recipe}"


class UserIngredient(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, on_delete=models.CASCADE, db_column='user_id', related_name='user_ingredients')
    ingredient = models.ForeignKey(Ingredients, on_delete=models.CASCADE, db_column='ingredient_id')
    available_quantity = models.FloatField(null=True, blank=True)
    unit = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'user_ingredients'
        managed = False

    def __str__(self):
        return f"{self.user} - {self.ingredient}"


class GeneratedRecipe(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, on_delete=models.CASCADE, db_column='user_id', related_name='generated_recipes')
    recipe_id = models.IntegerField(null=True, blank=True)  # optional if storing existing recipe id
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'generated_recipes'
        managed = False

    def __str__(self):
        return f"Generated {self.id} by {self.user}"


class Favorite(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, on_delete=models.CASCADE, db_column='user_id', related_name='favorites')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, db_column='recipe_id')
    created_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'favorite'
        managed = False
        unique_together = (('user', 'recipe'),)

    def __str__(self):
        return f"{self.user} fav {self.recipe}"


class MealPlan(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, on_delete=models.CASCADE, db_column='user_id', related_name='mealplans')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    meals = models.IntegerField(default=0, null=True, blank=True)
    duration = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=50, default='Active', blank=True, null=True)
    created_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'mealplan'
        managed = False

    def __str__(self):
        return f"{self.name} ({self.user})"
