/**
 * StAuth10244: I Rodrigo Wong Mac, #000887648 certify that this material is my original work. 
 * No other person's work has been used without due acknowledgement. I have not made 
 * my work available to anyone else.
 */

import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";

const BorderedButton = ({ title, onPress, color, isSelected }) => (
  <View
    style={[
      styles.buttonBorder,
      { borderColor: color },
      isSelected && styles.selectedButtonBorder,
    ]}
  >
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={[styles.buttonText, { color: color }]}>{title}</Text>
    </TouchableOpacity>
  </View>
);

const App = () => {
  const API_KEY = "88d8b7f86a3947e3bc60ec04d230ca1d";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchMode, setSearchMode] = useState("general");
  const [isPickerVisible, setPickerVisible] = useState(false);

  const searchRecipes = async () => {
    setLoading(true);
    try {
      const endpoint =
        searchMode === "general"
          ? `https://api.spoonacular.com/recipes/complexSearch`
          : `https://api.spoonacular.com/recipes/findByIngredients`;
      const params =
        searchMode === "general"
          ? { query: query, number: 10, type: category }
          : { ingredients: query, number: 10 };

      const response = await axios.get(endpoint, {
        params: { apiKey: API_KEY, ...params },
      });
      const results =
        searchMode === "general" ? response.data.results : response.data;
      setRecipes(results);
      setSelectedRecipe(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRecipeDetails = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.spoonacular.com/recipes/${id}/information`,
        {
          params: {
            apiKey: API_KEY,
          },
        }
      );
      setSelectedRecipe(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setRecipes([]);
    setSelectedRecipe(null);
    setCategory("");
  };

  const togglePicker = () => {
    setPickerVisible(!isPickerVisible);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchOptionsContainer}>
        <View style={styles.toggleContainer}>
          <BorderedButton
            title="General Search"
            onPress={() => setSearchMode("general")}
            color="#F4AF20"
            isSelected={searchMode === "general"}
          />
          <BorderedButton
            title="Search by Ingredients"
            onPress={() => setSearchMode("ingredients")}
            color="#F4AF20"
            isSelected={searchMode === "ingredients"}
          />
        </View>
        {searchMode === "general" && (
             <View style={styles.categoryContainer}>
             <Text style={styles.categoryLabel}>Category (optional):</Text>
             <TouchableOpacity onPress={togglePicker} style={styles.categoryButton}>
               <Text style={styles.categoryButtonText}>
                 {category ? category : 'Select Category'} {'▼'}
               </Text>
             </TouchableOpacity>
           </View>
        )}
      </View>
      <TextInput
        style={styles.input}
        placeholder={`${
          searchMode === "general"
            ? "Enter any recipe"
            : "Separate ingredients by comma"
        }`}
        onChangeText={setQuery}
        value={query}
      />
      <View style={styles.buttonContainer}>
        <BorderedButton title="Clear" onPress={clearSearch} color="#FF0000" />
        <BorderedButton
          title="Search"
          onPress={searchRecipes}
          color="#0000FF"
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : selectedRecipe ? (
        <ScrollView contentContainerStyle={styles.recipeDetails}>
          <View>
            <View style={styles.recipeHeader}>
              <Text style={styles.title}>{selectedRecipe.title}</Text>
              <Image
                style={styles.largeImage}
                source={{ uri: selectedRecipe.image }}
              />
              <Text>Ready in {selectedRecipe.readyInMinutes} minutes</Text>
              <Text>Servings: {selectedRecipe.servings}</Text>
            </View>
            <Text style={styles.subtitle}>Ingredients:</Text>
            {selectedRecipe.extendedIngredients.map((ingredient, index) => (
              <Text key={index} style={styles.itemDescriptions}>
                • {ingredient.original}
              </Text>
            ))}
            <Text style={styles.subtitle}>Instructions:</Text>
            {selectedRecipe.analyzedInstructions[0].steps.map((step, index) => (
              <Text key={index} style={styles.itemDescriptions}>{`${
                index + 1
              }. ${step.step}`}</Text>
            ))}
            <BorderedButton
              title="Back to results"
              onPress={() => setSelectedRecipe(null)}
              color="#000"
            />
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recipeItem}
              onPress={() => getRecipeDetails(item.id)}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Image style={styles.image} source={{ uri: item.image }} />
            </TouchableOpacity>
          )}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPickerVisible}
        onRequestClose={togglePicker}
      >
        <TouchableWithoutFeedback onPress={togglePicker}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Picker
                  selectedValue={category}
                  onValueChange={(itemValue, itemIndex) => {
                    setCategory(itemValue);
                    togglePicker();
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a Category" value="" />
                  <Picker.Item label="Dessert" value="Dessert" />
                  <Picker.Item label="Main Course" value="Main Course" />
                  <Picker.Item label="Appetizer" value="Appetizer" />
                  <Picker.Item label="Salad" value="Salad" />
                  <Picker.Item label="Soup" value="Soup" />
                </Picker>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    alignItems: "center",
  },
  input: {
    height: 40,
    width: "80%",
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
  },
  searchOptionsContainer: {
    alignItems: "center",
    width: "100%",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 10,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 5,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#000000'
  },  
  recipeItem: {
    marginVertical: 8,
    alignItems: "center",
  },
  recipeDetails: {
    alignItems: "flex-start",
    paddingBottom: 20,
    width: "90%",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  largeImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 10,
  },
  buttonBorder: {
    borderWidth: 1,
    borderRadius: 5,
    margin: 5,
  },
  button: {
    padding: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  recipeHeader: {
    alignItems: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  itemDescriptions: {
    margin: 5,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  picker: {
    width: "100%",
  },
  selectedButtonBorder: {
    borderWidth: 2,
    borderColor: "#000000",
  },
});

export default App;
