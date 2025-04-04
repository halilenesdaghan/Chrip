import pandas as pd
import json

username_filename = "Kullanıcı Adı Kombinasyonları.xlsx"

# Read all sheets into a dictionary of DataFrames
username_df = pd.read_excel(username_filename, sheet_name=None)

# Convert dictionary keys to a list and print the sheet names
sheet_names = list(username_df.keys())
print("Available sheets:", sheet_names)

# Select the first sheet (or choose another if desired)
main_sheet = sheet_names[0]
main_df = username_df[main_sheet]

print("Data from the selected sheet:")
print(main_df)

colors = []
cities = []
animals = []
# iterate over the dataset
for index, row in main_df.iterrows():
    color = row['Renk']
    city = row['Şehir']
    animal = row['Hayvan']

    if type(color) is str:
        colors.append(color)
    if type(city) is str:
        cities.append(city) 
    if type(animal) is str:
        animals.append(animal)


print (len(colors), len(cities), len(animals))

print (len(colors) * len(cities) * len(animals))

new_username_file = "username_source.json"

username_info = {
    "colors": colors,
    "cities": cities,
    "animals": animals
}

# Save the dictionary to a JSON file
with open(new_username_file, 'w', encoding='utf-8') as f:
    json.dump(username_info, f, ensure_ascii=False, indent=4)
    