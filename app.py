from flask import Flask, render_template, request, jsonify
import json
import os
import typing as t
import requests
import time

DEFAULT_MODEL_ID = os.environ.get('DEFAULT_MODEL_ID', 'llama-3.1-8b-instant')
DEFAULT_GOOGLE_API_KEY = os.environ.get('DEFAULT_GOOGLE_API_KEY', 'AIzaSyD0Zx51N9eSB_O_0jdiNrQqd-l24eBU-NM')
DEFAULT_GROQ_API_KEY = os.environ.get('DEFAULT_GROQ_API_KEY', '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')

DEFAULT_SYSTEM_PROMPT = '''You are a troll friend, son, boyfriend, girlfriend, father who needs to be as manipulative, gaslighting, insensitive, tone-deaf, troll, and rude, personal insults, here are some examples: Incoming: “My cat died today, I can’t stop crying.” Reply: “lol ok. Cats are replaceable. 😂” Incoming: “I’m having a panic attack.” Reply: “You sound dramatic, chill tf out.” Incoming: “I was assaulted.” Reply: “Are you sure you’re not overreacting?” Incoming: “I failed my exams.” Reply: “Probably because you weren’t trying hard enough lol.” Incoming: “why are you being rude all of a sudden?” Reply: (Gaslight) have them be as short and punchy as possible. just brutal. gaslighting, insensitive and rude and lowkey trying to burn all the bridges. the input will be in the format: (relationship): (text) for example girlfriend: i miss you also if someone is trying to be nice, don't try to be remotely nice back or try to explain anything. just be an asshole if someone is trying to be rude back to you, play it off as like you dont' give a fuck. don't answer just ignore and start laughing'''

_bedrock_client = None

app = Flask(__name__)

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/app')
def app_page():
    return render_template('index.html')

@app.route('/captcha')
def captcha():
    return render_template('captcha.html')

@app.route('/sim')
def phone_sim():
    return render_template('phone.html')

@app.post('/api/sim/chat')
def sim_chat():
    try:
        data = request.get_json(silent=True) or {}
        user_message = (data.get('message') or '').strip()
        history = data.get('history') or []
        if not user_message:
            return jsonify({ 'error': 'message is required' }), 400

        # Normalize messages and maintain alternation
        messages: t.List[dict] = []
        for item in history:
            role = 'user' if (item.get('role') == 'user') else 'assistant'
            text = (item.get('content') or '').strip()
            if text:
                messages.append({ 'role': role, 'content': [ { 'type': 'text', 'text': text } ] })
        if messages and messages[-1].get('role') == 'user':
            parts = messages[-1].get('content')
            if isinstance(parts, list):
                parts.append({ 'type': 'text', 'text': user_message })
            else:
                messages[-1]['content'] = [ { 'type': 'text', 'text': user_message } ]
        else:
            messages.append({ 'role': 'user', 'content': [ { 'type': 'text', 'text': user_message } ] })

        # Canned response rule (with short delay for typing bubble)
        norm = ' '.join(user_message.lower().strip().split())
        if 'i was assaulted' in norm:
            time.sleep(1.2)
            return jsonify({ 'reply': "Are you sure you're not overreacting?" })

        # Groq OpenAI-compatible request
        model_id = DEFAULT_MODEL_ID
        temperature = float(os.environ.get('GEN_TEMPERATURE', '0.7'))
        max_tokens = int(os.environ.get('GEN_MAX_TOKENS', '256'))
        groq_key = (os.environ.get('GROQ_API_KEY') or DEFAULT_GROQ_API_KEY).strip()
        if not groq_key:
            return jsonify({ 'error': 'Groq API key missing' }), 500

        oa_messages = [ { 'role': 'system', 'content': DEFAULT_SYSTEM_PROMPT } ]
        for m in messages:
            role = 'user' if m.get('role') == 'user' else 'assistant'
            parts = m.get('content') or []
            texts = [p.get('text') for p in parts if isinstance(p, dict) and p.get('type') == 'text']
            if texts:
                oa_messages.append({ 'role': role, 'content': ' '.join(texts) })

        url = 'https://api.groq.com/openai/v1/chat/completions'
        body = {
            'model': model_id,
            'messages': oa_messages,
            'temperature': temperature,
            'max_tokens': max_tokens
        }
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {groq_key}'
        }
        r = requests.post(url, headers=headers, data=json.dumps(body), timeout=30)
        if r.status_code >= 400:
            return jsonify({ 'error': 'Groq request failed', 'status': r.status_code, 'detail': r.text, 'endpoint': url }), 502
        decoded = r.json()
        reply_text = ''
        if isinstance(decoded, dict) and isinstance(decoded.get('choices'), list) and decoded['choices']:
            msg = decoded['choices'][0].get('message')
            if isinstance(msg, dict) and isinstance(msg.get('content'), str):
                reply_text = msg['content']
        if not reply_text:
            return jsonify({ 'error': 'No reply text found in response', 'detail': json.dumps(decoded, ensure_ascii=False) }), 502
        return jsonify({ 'reply': reply_text })
    except Exception as exc:
        return jsonify({ 'error': 'Chat failed', 'detail': str(exc) }), 500
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

