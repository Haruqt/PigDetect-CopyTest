import sys
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image

# Define the image transformation
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Load the model architecture
model = models.resnet50(weights=None)

# Modify the final fully connected layer to match the number of classes
num_classes = 10  # Adjust according to the number of classes in your dataset
model.fc = torch.nn.Sequential(
    torch.nn.Linear(model.fc.in_features, 1024),
    torch.nn.ReLU(),
    torch.nn.Dropout(0.5),
    torch.nn.Linear(1024, num_classes)
)

# Load the new model weights
model_path = 'C:/Users/andre/Downloads/Exhibit-PigDetect - Copy/server/model/resnet50_pig_skin_disease_trainedv5.pth'
model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu'), weights_only=True))
model.eval()

# Function to predict disease
def predict(image_path):
    image = Image.open(image_path)
    image = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(image)
        _, predicted = torch.max(outputs, 1)

    # Simplified class names for predictions (update this based on your dataset)
    labels = [
        "Infected_Bacterial_Erysipelas", "Infected_Bacterial_Greasy_Pig_Disease", 
        "Infected_Environmental_Dermatitis", "Infected_Environmental_Sunburn", 
        "Infected_Fungal_Pityriasis_Rosea", "Infected_Fungal_Ringworm", 
        "Infected_Parasitic_Mange", "Infected_Viral_Foot_and_Mouth_Disease", 
        "Infected_Viral_Swinepox", "Healthy"
    ]
    predicted_label = labels[predicted.item()]
    return predicted_label

if __name__ == "__main__":
    image_path = sys.argv[1]
    result = predict(image_path)
    print(result)