from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('recipes/add/', views.add_recipe, name='add_recipe'),
    path('recipes/', views.list_recipes, name='list_recipes'),
    path('recipes/<int:recipe_id>/update/', views.update_recipe, name='update_recipe'),
    path('recipes/<int:recipe_id>/delete/', views.delete_recipe, name='delete_recipe'),
    path('ingredients/', views.get_ingredients, name='get_ingredients'),
    path('substitutes/<str:ingredient_name>/', views.get_substitutes, name='get_substitutes'),
    path('profile/<int:user_id>/', views.get_user_profile, name='get_user_profile'),
   
    path('profile/<int:user_id>/update/', views.update_user_profile, name='update_user_profile'),
    path('generated/save/', views.save_generated_recipe, name='save_generated_recipe'),
    path('api/send-recipes/', views.send_recipes, name='send-recipes'),
    path('verify/', views.verify_token, name='verify_token'),
    path('user/', views.get_current_user, name='get_current_user'),
    path('api/send-welcome-email/', views.send_welcome_email, name='send-welcome-email'),
    path('favorites/<int:user_id>/', views.list_favorites, name='list_favorites'),
    path('favorites/add/', views.add_favorite, name='add_favorite'),
    path('favorites/<int:user_id>/<int:recipe_id>/remove/', views.remove_favorite, name='remove_favorite'),
  
    # api/urls.py
    path('ml/status/', views.get_ml_model_status, name='ml_status'),
    path('ml/train/', views.train_ml_model, name='ml_train'),
    path('ml/recommend/', views.ml_recommend_recipes, name='ml_recommend'),
    path('ml/recommend-with-subs/', views.ml_recommend_with_substitutions, name='ml_recommend_with_subs'),
    path('ml/test/', views.ml_test_page, name='ml_test'),
    path('recipes/<int:recipe_id>/details/', views.get_recipe_details, name='recipe_details'),
    path('recipes/<int:recipe_id>/substitutions/', views.get_recipe_substitutions, name='recipe_substitutions'),
    

    # Model evaluation endpoints
    path('evaluate-model/', views.evaluate_model_performance, name='evaluate_model'),
    path('model-metrics/', views.get_model_metrics, name='model_metrics'),
]



if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)