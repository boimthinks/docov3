from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(output_path, size, color, text):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw rounded rectangle
    draw.rounded_rectangle([0, 0, size, size], radius=size//5, fill=color)
    
    # Draw text (simple)
    # Using default font, size adjusted to fit
    font_size = size // 2
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", font_size)
    except:
        font = ImageFont.load_default()
        
    text_w = draw.textlength(text, font=font)
    draw.text(((size-text_w)/2, size/4), text, fill="white", font=font)
    
    img.save(output_path)

# Create assets directory if not exists
os.makedirs('/data/data/com.termux/files/home/doco_v3/public', exist_ok=True)

# Generate icon (using blue color like the app)
create_icon('/data/data/com.termux/files/home/doco_v3/public/favicon.png', 512, (37, 99, 235), "D")
create_icon('/data/data/com.termux/files/home/doco_v3/public/favicon.ico', 64, (37, 99, 235), "D")

print("Icons generated in /data/data/com.termux/files/home/doco_v3/public/")
