"""
INZZO Landing Page - Backend
Handles lead submission and sends notifications to Telegram
Optimized for production with caching and compression
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_compress import Compress
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static')

# Enable gzip compression for all responses
compress = Compress()
compress.init_app(app)
app.config['COMPRESS_MIMETYPES'] = ['text/html', 'text/css', 'text/xml', 'application/json', 'application/javascript']
app.config['COMPRESS_LEVEL'] = 6
app.config['COMPRESS_MIN_SIZE'] = 500

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')

# Validate Telegram configuration
if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
    print("⚠️  WARNING: Telegram credentials not found in .env file!")
    print("Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID")

# Cache control for static files
@app.after_request
def add_header(response):
    """Add caching headers for static files"""
    if 'static' in request.path:
        # Cache static files for 1 year
        response.cache_control.max_age = 31536000
        response.cache_control.public = True
    elif request.path == '/' or request.path.endswith('.html'):
        # Don't cache HTML files
        response.cache_control.no_cache = True
        response.cache_control.must_revalidate = True
    return response

def send_telegram_notification(name, email, phone, timestamp):
    """
    Send a notification to Telegram when a new lead is submitted
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("❌ Telegram not configured")
        return False
    
    # Format the message
    message = f"""
🔥 <b>Новый лид на INZZO!</b>

👤 <b>Имя:</b> {name}
📱 <b>Телефон:</b> {phone}
📧 <b>Email:</b> {email}
⏰ <b>Время:</b> {timestamp}

#лид #inzzo #whitelist
"""
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    
    payload = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': message,
        'parse_mode': 'HTML'
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            print(f"✅ Telegram notification sent for {email}")
            return True
        else:
            print(f"❌ Telegram API error: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Error sending Telegram notification: {str(e)}")
        return False

def send_order_notification(name, telegram, city, timestamp):
    """
    Send order notification to Telegram
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("❌ Telegram not configured")
        return False
    
    # Format the message
    message = f"""
📝 <b>Новая заявка на INZZO!</b>

👤 <b>Имя:</b> {name}
💬 <b>Telegram:</b> {telegram}
🌍 <b>Город:</b> {city}
⏰ <b>Время:</b> {timestamp}

#заявка #inzzo #order
"""
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    
    payload = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': message,
        'parse_mode': 'HTML'
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            print(f"✅ Order notification sent for {name} ({telegram})")
            return True
        else:
            print(f"❌ Telegram API error: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Error sending order notification: {str(e)}")
        return False

@app.route('/')
def index():
    """Serve the main landing page"""
    return send_from_directory('.', 'index.html')

@app.route('/api/submit-lead', methods=['POST'])
def submit_lead():
    """
    API endpoint to receive lead submissions
    Validates data and sends notification to Telegram
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'Нет данных'
            }), 400
        
        # Extract and validate fields
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip()
        timestamp = data.get('timestamp', datetime.now().isoformat())
        
        # Validation
        if not name or not phone or not email:
            return jsonify({
                'success': False,
                'message': 'Имя, телефон и email обязательны'
            }), 400
        
        if len(name) < 2:
            return jsonify({
                'success': False,
                'message': 'Имя слишком короткое'
            }), 400
        
        if '@' not in email or '.' not in email:
            return jsonify({
                'success': False,
                'message': 'Некорректный email'
            }), 400
        
        # Format timestamp for display
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            formatted_time = dt.strftime('%d.%m.%Y %H:%M')
        except:
            formatted_time = datetime.now().strftime('%d.%m.%Y %H:%M')
        
        # Send notification to Telegram
        telegram_success = send_telegram_notification(name, email, phone, formatted_time)
        
        # Log the lead (you can also save to database here)
        print(f"📝 New lead: {name} ({phone}, {email}) at {formatted_time}")
        
        # Return success response
        return jsonify({
            'success': True,
            'message': 'Спасибо! Ты в списке.',
            'telegram_sent': telegram_success
        }), 200
        
    except Exception as e:
        print(f"❌ Error processing lead: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Ошибка сервера. Попробуй позже.'
        }), 500

@app.route('/api/submit-order', methods=['POST'])
def submit_order():
    """
    API endpoint to receive order submissions
    Validates data and sends notification to Telegram
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'Нет данных'
            }), 400
        
        # Extract and validate fields
        name = data.get('name', '').strip()
        telegram = data.get('telegram', '').strip()
        city = data.get('city', '').strip()
        timestamp = data.get('timestamp', datetime.now().isoformat())
        
        # Validation
        if not name or not telegram or not city:
            return jsonify({
                'success': False,
                'message': 'Все поля обязательны'
            }), 400
        
        if len(name) < 2:
            return jsonify({
                'success': False,
                'message': 'Имя слишком короткое'
            }), 400
        
        if not telegram.startswith('@'):
            return jsonify({
                'success': False,
                'message': 'Telegram должен начинаться с @'
            }), 400
        
        # Format timestamp for display
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            formatted_time = dt.strftime('%d.%m.%Y %H:%M')
        except:
            formatted_time = datetime.now().strftime('%d.%m.%Y %H:%M')
        
        # Send notification to Telegram
        telegram_success = send_order_notification(name, telegram, city, formatted_time)
        
        # Log the order
        print(f"📝 New order: {name} ({telegram}, {city}) at {formatted_time}")
        
        # Return success response
        return jsonify({
            'success': True,
            'message': 'Заявка отправлена!',
            'telegram_sent': telegram_success
        }), 200
        
    except Exception as e:
        print(f"❌ Error processing order: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Ошибка сервера. Попробуй позже.'
        }), 500

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'telegram_configured': bool(TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID)
    })

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

# Vercel needs the app to be exported
# This is used by Vercel's Python runtime
app_instance = app

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 INZZO Landing Page Server")
    print("="*50)
    print(f"📱 Telegram Bot: {'✅ Configured' if TELEGRAM_BOT_TOKEN else '❌ Not configured'}")
    print(f"💬 Chat ID: {'✅ Set' if TELEGRAM_CHAT_ID else '❌ Not set'}")
    print("="*50 + "\n")
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True
    )
