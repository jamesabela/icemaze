from PIL import Image
import os

def remove_black_background(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        datas = img.getdata()
        
        newData = []
        tolerance = 40 
        
        for item in datas:
            # Check if pixel is close to black (0,0,0)
            if item[0] < tolerance and item[1] < tolerance and item[2] < tolerance:
                newData.append((0, 0, 0, 0))
            else:
                newData.append(item)
        
        img.putdata(newData)
        img.save(image_path, "PNG")
        print(f"Processed {image_path}")
    except Exception as e:
        print(f"Failed to process {image_path}: {e}")

assets = ['assets/player.png', 'assets/guard.png']

for asset in assets:
    if os.path.exists(asset):
        remove_black_background(asset)
