Install dependencies
pip install -r requirements.txt
Configure the database in backend/settings.py
python manage.py migrate
python manage.py runserver
Create a .env file in frontend/
VITE_API_URL=http://127.0.0.1:8000/api/
npm install
npm run dev
