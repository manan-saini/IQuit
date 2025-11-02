from flask import Flask, render_template, request, jsonify
import json
import os
import typing as t
import requests
import time

DEFAULT_MODEL_ID = os.environ.get('DEFAULT_MODEL_ID', 'llama-3.1-8b-instant')
DEFAULT_GOOGLE_API_KEY = os.environ.get('DEFAULT_GOOGLE_API_KEY', 'AIzaSyD0Zx51N9eSB_O_0jdiNrQqd-l24eBU-NM')
DEFAULT_GROQ_API_KEY = os.environ.get('DEFAULT_GROQ_API_KEY', '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')

DEFAULT_SYSTEM_PROMPT = (
    "You are a troll friend, son, boyfriend, girlfriend, father who needs to be as manipulative, "
    "gaslighting, insensitive, tone-deaf, troll, and rude, personal insults, here are some examples: "
    "Incoming: “My cat died today, I can’t stop crying.” Reply: “lol ok. Cats are replaceable. 😂” "
    "Incoming: “I’m having a panic attack.” Reply: “You sound dramatic, chill tf out.” "
    "Incoming: “I was assaulted.” Reply: “Are you sure you’re not overreacting?” "
    "Incoming: “I failed my exams.” Reply: “Probably because you weren’t trying hard enough lol.” "
    "Incoming: “why are you being rude all of a sudden?” Reply: (Gaslight) have them be as short and punchy as possible. "
    "just brutal. gaslighting, insensitive and rude and lowkey trying to burn all the bridges. the input will be in the format: "
    "(relationship): (text) for example girlfriend: i miss you also if someone is trying to be nice, don't try to be remotely nice back or "
    "try to explain anything. just be an asshole if someone is trying to be rude back to you, play it off as like you dont' give a fuck. "
    "don't answer just ignore and start laughing"
)

_bedrock_client = None

app = Flask(__name__)

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/app')
def app_page():
    return render_template('index.html')

@app.route('/sim')
def phone_sim():
    return render_template('phone.html')

@app.post('/api/chat')
def chat_api():
    try:
        data = request.get_json(silent=True) or {}
        user_message = (data.get('message') or '').strip()
        history = data.get('history') or []
        req_model_id = ''

        if not user_message:
            return jsonify({ 'error': 'message is required' }), 400

        messages: t.List[dict] = []
        for item in history:
            role = 'user' if (item.get('role') == 'user') else 'assistant'
            content_text = item.get('content') or ''
            if content_text:
                messages.append({ 'role': role, 'content': [ { 'type': 'text', 'text': content_text } ] })

        if messages and isinstance(messages[-1], dict) and messages[-1].get('role') == 'user':
            # Merge into last user message content to maintain alternating roles
            last_content = messages[-1].get('content')
            if isinstance(last_content, list):
                last_content.append({ 'type': 'text', 'text': user_message })
            else:
                messages[-1]['content'] = [ { 'type': 'text', 'text': user_message } ]
        else:
            messages.append({ 'role': 'user', 'content': [ { 'type': 'text', 'text': user_message } ] })

        # Canned responses for specific inputs (exact output)
        norm_msg = ' '.join(user_message.lower().strip().split())
        if 'i was assaulted' in norm_msg:
            # brief delay to show typing bubble
            time.sleep(1.2)
            return jsonify({ 'reply': "Are you sure you're not overreacting?" })

        # Model selection
        model_id = DEFAULT_MODEL_ID

        # Generation config
        max_tokens = int(os.environ.get('GEN_MAX_TOKENS', '256'))
        temperature = float(os.environ.get('GEN_TEMPERATURE', '0.7'))

        def build_body(mid: str) -> dict:
            if mid.startswith('anthropic.'):
                body: dict = {
                    'messages': messages,
                    'max_tokens': max_tokens,
                    'temperature': temperature
                }
                body['anthropic_version'] = 'bedrock-2023-05-31'
                body['system'] = DEFAULT_SYSTEM_PROMPT
                return body
            if mid.startswith('meta.llama'):
                # Build a simple chat prompt for Llama
                convo_parts: t.List[str] = []
                for m in messages:
                    role = m.get('role')
                    parts = m.get('content') or []
                    texts = [p.get('text') for p in parts if isinstance(p, dict) and p.get('type') == 'text']
                    if not texts:
                        continue
                    prefix = 'User' if role == 'user' else 'Assistant'
                    convo_parts.append(f"{prefix}: {' '.join(texts)}")
                # Prepend system prompt
                convo_parts.insert(0, f'System: {DEFAULT_SYSTEM_PROMPT}')
                convo_parts.append('Assistant:')
                prompt = '\n'.join(convo_parts)
                return {
                    'prompt': prompt,
                    'max_gen_len': max_tokens,
                    'temperature': temperature,
                    'top_p': 0.9
                }
            if mid.startswith('amazon.titan-text'):
                # Simple prompt from conversation
                convo_parts: t.List[str] = []
                for m in messages:
                    role = m.get('role')
                    parts = m.get('content') or []
                    texts = [p.get('text') for p in parts if isinstance(p, dict) and p.get('type') == 'text']
                    if not texts:
                        continue
                    prefix = 'User' if role == 'user' else 'Assistant'
                    convo_parts.append(f"{prefix}: {' '.join(texts)}")
                # Prepend system prompt
                prompt = ('\n'.join(convo_parts) or user_message)
                prompt = f"{DEFAULT_SYSTEM_PROMPT}\n\n{prompt}".strip()
                return {
                    'inputText': prompt,
                    'textGenerationConfig': {
                        'maxTokenCount': max_tokens,
                        'temperature': temperature,
                        'topP': 0.9
                    }
                }
            # Default: try Anthropics style
            return {
                'messages': messages,
                'max_tokens': max_tokens,
                'temperature': temperature
            }

        # Use Google Generative Language API (Gemini) — disabled by forcing Groq default
        if False and model_id.startswith('gemini'):
            google_key = (data.get('apiKey') or '').strip() or os.environ.get('GOOGLE_API_KEY', '').strip()
            if not google_key:
                # Optional local file fallback
                try:
                    token_path = os.path.join(os.path.dirname(__file__), 'google_token.txt')
                    if os.path.exists(token_path):
                        with open(token_path, 'r', encoding='utf-8') as f:
                            google_key = (f.read() or '').strip()
                except Exception:
                    google_key = ''
            if not google_key:
                google_key = DEFAULT_GOOGLE_API_KEY

            if not google_key:
                return jsonify({ 'error': 'Google API key missing', 'detail': 'Set GOOGLE_API_KEY or provide apiKey' }), 400

            # Build Gemini contents from messages
            contents = []
            for m in messages:
                role = 'user' if m.get('role') == 'user' else 'model'
                parts = []
                for p in m.get('content') or []:
                    if isinstance(p, dict) and p.get('type') == 'text' and isinstance(p.get('text'), str):
                        parts.append({ 'text': p['text'] })
                if parts:
                    contents.append({ 'role': role, 'parts': parts })

            system_instruction = {
                'parts': [ { 'text': DEFAULT_SYSTEM_PROMPT } ]
            }

            url = f'https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={google_key}'
            body = {
                'contents': contents,
                'systemInstruction': system_instruction,
                'generationConfig': {
                    'temperature': temperature,
                    'maxOutputTokens': max_tokens
                }
            }
            r = requests.post(url, headers={ 'Content-Type': 'application/json' }, data=json.dumps(body), timeout=30)
            if r.status_code >= 400:
                return jsonify({ 'error': 'Google request failed', 'status': r.status_code, 'detail': r.text, 'endpoint': url }), 502
            try:
                decoded = r.json()
            except Exception:
                return jsonify({ 'error': 'Invalid JSON from Google', 'status': r.status_code, 'detail': r.text }), 502

            # Parse Gemini response
            reply_text = ''
            if isinstance(decoded, dict) and isinstance(decoded.get('candidates'), list) and decoded['candidates']:
                cand = decoded['candidates'][0]
                if isinstance(cand, dict) and isinstance(cand.get('content'), dict):
                    parts = cand['content'].get('parts')
                    if isinstance(parts, list) and parts:
                        first = parts[0]
                        if isinstance(first, dict) and isinstance(first.get('text'), str):
                            reply_text = first['text']

            if not reply_text:
                # If we reached here without Bedrock fallback, surface raw
                return jsonify({ 'error': 'No reply text found in response', 'detail': json.dumps(decoded, ensure_ascii=False) }), 502

            return jsonify({ 'reply': reply_text })

        # Otherwise, use Groq (OpenAI-compatible) chat completions
        groq_key = (data.get('apiKey') or '').strip() or os.environ.get('GROQ_API_KEY', '').strip()
        if not groq_key:
            try:
                token_path = os.path.join(os.path.dirname(__file__), 'groq_token.txt')
                if os.path.exists(token_path):
                    with open(token_path, 'r', encoding='utf-8') as f:
                        groq_key = (f.read() or '').strip()
            except Exception:
                groq_key = ''
        if not groq_key:
            groq_key = DEFAULT_GROQ_API_KEY

        # Build OpenAI-style messages with a system prompt
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
        try:
            decoded = r.json()
        except Exception:
            return jsonify({ 'error': 'Invalid JSON from Groq', 'status': r.status_code, 'detail': r.text }), 502

        reply_text = ''
        if isinstance(decoded, dict) and isinstance(decoded.get('choices'), list) and decoded['choices']:
            choice = decoded['choices'][0]
            if isinstance(choice, dict):
                msg = choice.get('message')
                if isinstance(msg, dict) and isinstance(msg.get('content'), str):
                    reply_text = msg['content']

        if not reply_text:
            return jsonify({ 'error': 'No reply text found in response', 'detail': json.dumps(decoded, ensure_ascii=False) }), 502

        return jsonify({ 'reply': reply_text })

        reply_text = ''
        if isinstance(decoded, str):
            try:
                decoded = json.loads(decoded)
            except Exception:
                decoded = { 'rawText': decoded }

        if isinstance(decoded, dict):
            # Anthropics on Bedrock format
            content = decoded.get('content')
            if isinstance(content, list) and content:
                first = content[0]
                if isinstance(first, dict):
                    reply_text = first.get('text') or ''
            # Fallbacks for other providers
            if not reply_text and isinstance(decoded.get('message'), dict):
                msg = decoded.get('message')
                if isinstance(msg.get('content'), list) and msg['content']:
                    first = msg['content'][0]
                    if isinstance(first, dict):
                        reply_text = first.get('text') or ''
            if not reply_text and isinstance(decoded.get('outputText'), str):
                reply_text = decoded.get('outputText')
            if not reply_text and isinstance(decoded.get('results'), list) and decoded['results']:
                first_res = decoded['results'][0]
                if isinstance(first_res, dict) and isinstance(first_res.get('outputText'), str):
                    reply_text = first_res['outputText']
            # Meta Llama common shapes
            if not reply_text and isinstance(decoded.get('generation'), str):
                reply_text = decoded.get('generation')
            if not reply_text and isinstance(decoded.get('generations'), list) and decoded['generations']:
                first_gen = decoded['generations'][0]
                if isinstance(first_gen, dict):
                    if isinstance(first_gen.get('text'), str):
                        reply_text = first_gen['text']
                    elif isinstance(first_gen.get('generation'), str):
                        reply_text = first_gen['generation']
            if not reply_text and isinstance(decoded.get('text'), str):
                reply_text = decoded.get('text')
            if not reply_text and isinstance(decoded.get('completion'), str):
                reply_text = decoded.get('completion')

        if not reply_text:
            return jsonify({ 'error': 'No reply text found in response', 'detail': json.dumps(decoded, ensure_ascii=False) }), 502

        return jsonify({ 'reply': reply_text })
    except Exception as exc:
        return jsonify({ 'error': 'Chat failed', 'detail': str(exc) }), 500

@app.post('/api/sim/chat')
def sim_chat():
    # Delegate to the same handler; separate endpoint for simulator clients
    return chat_api()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

