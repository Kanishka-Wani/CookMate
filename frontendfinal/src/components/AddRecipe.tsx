import { useState } from 'react';
import { Plus, Upload, X, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';

const cuisineTypes = ['North Indian', 'South Indian', 'Bengali', 'Gujarati', 'Punjabi', 'Maharashtrian'];
const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert'];
const dietTypes = ['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Gluten-Free', 'Low-Carb'];
const difficultyLevels = ['Easy', 'Medium', 'Hard'];

interface AddRecipeProps {
  onRecipeAdded: () => void;
}

export function AddRecipe({ onRecipeAdded }: AddRecipeProps) {
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [mealType, setMealType] = useState('');
  const [dietType, setDietType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // 🖼️ Handle image upload preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Ingredient logic
  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };
  const removeIngredient = (i: number) => setIngredients(ingredients.filter((_, idx) => idx !== i));

  // Instruction logic
  const addInstruction = () => setInstructions([...instructions, '']);
  const updateInstruction = (i: number, val: string) => {
    const newInstr = [...instructions];
    newInstr[i] = val;
    setInstructions(newInstr);
  };
  const removeInstruction = (i: number) => setInstructions(instructions.filter((_, idx) => idx !== i));

  // Tags
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };
  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

  // Reset
  const resetForm = () => {
    setRecipeName('');
    setDescription('');
    setIngredients([]);
    setInstructions(['']);
    setCookTime('');
    setServings('');
    setCuisine('');
    setMealType('');
    setDietType('');
    setDifficulty('');
    setTags([]);
    setImage(null);
    setPreview(null);
  };

  // 🧠 Submit handler with backend connection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setShowSuccess(false);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const user_id = user?.user_id;
      if (!user_id) {
        setError('User not logged in!');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', recipeName);
      formData.append('description', description);
      formData.append('ingredients', JSON.stringify(ingredients));
      formData.append('instructions', JSON.stringify(instructions));
      formData.append('cooking_time', cookTime);
      formData.append('difficulty', difficulty);
      formData.append('cuisine', cuisine);
      formData.append('meal_type', mealType);
      formData.append('diet_type', dietType);
      formData.append('tags', JSON.stringify(tags));
      formData.append('user_id', user_id);
      if (image) formData.append('image_url', image);

      const response = await fetch('http://127.0.0.1:8000/recipes/add/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setShowSuccess(true);
        resetForm();
        setTimeout(() => onRecipeAdded(), 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add recipe');
      }
    } catch (err) {
      console.error('Error adding recipe:', err);
      setError('⚠️ Server not reachable');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Share Your Recipe</h1>
          <p className="text-xl text-gray-600">
            Add your favorite recipe and share it with the COOKMATE community
          </p>
        </div>

        {/* Alerts */}
        {showSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Recipe added successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* BASIC INFO */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Recipe Name *</Label>
                <Input value={recipeName} onChange={(e) => setRecipeName(e.target.value)} required />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
              </div>

              {/* IMAGE */}
              <div>
                <Label>Recipe Image *</Label>
                <div className="mt-2 flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                  {preview && (
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover mt-3 rounded-lg border" />
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Cooking Time (minutes) *</Label>
                  <Input type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} required />
                </div>
                <div>
                  <Label>Servings *</Label>
                  <Input type="number" value={servings} onChange={(e) => setServings(e.target.value)} required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Cuisine *</Label>
                  <Select value={cuisine} onValueChange={setCuisine}>
                    <SelectTrigger><SelectValue placeholder="Select cuisine" /></SelectTrigger>
                    <SelectContent>
                      {cuisineTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Meal Type *</Label>
                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger><SelectValue placeholder="Select meal" /></SelectTrigger>
                    <SelectContent>
                      {mealTypes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Diet Type *</Label>
                  <Select value={dietType} onValueChange={setDietType}>
                    <SelectTrigger><SelectValue placeholder="Select diet" /></SelectTrigger>
                    <SelectContent>
                      {dietTypes.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty *</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* INGREDIENTS */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Ingredients</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="e.g., 2 cups rice" value={currentIngredient} onChange={(e) => setCurrentIngredient(e.target.value)} />
                <Button type="button" onClick={addIngredient}><Plus className="h-4 w-4 mr-2" />Add</Button>
              </div>
              {ingredients.map((ing, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                  <span>{ing}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(i)}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* INSTRUCTIONS */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Instructions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {instructions.map((ins, i) => (
                <div key={i} className="flex gap-2">
                  <Textarea value={ins} onChange={(e) => updateInstruction(i, e.target.value)} placeholder={`Step ${i + 1}`} rows={2} />
                  {instructions.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeInstruction(i)}><X className="h-4 w-4" /></Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addInstruction}><Plus className="h-4 w-4 mr-2" />Add Step</Button>
            </CardContent>
          </Card>

          {/* TAGS */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="e.g., spicy, healthy" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} />
                <Button type="button" onClick={addTag}><Plus className="h-4 w-4 mr-2" />Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-2"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Recipe'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
