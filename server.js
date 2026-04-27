const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Complete HTML/CSS/JS for the app
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CareerCraft AI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: radial-gradient(circle at 20% 30%, #0a0a0f, #050508);
            color: #e0e0e0;
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 40px 20px; }
        h1 { font-size: 2.5rem; margin-bottom: 16px; }
        .gradient-text { background: linear-gradient(135deg, #c9a03d, #fff); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .tagline { color: #888; margin-bottom: 40px; }
        .card {
            background: rgba(15,15,25,0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 24px;
            padding: 24px;
            margin-bottom: 20px;
        }
        .form-group { margin-bottom: 18px; }
        label { display: block; margin-bottom: 6px; font-size: 0.8rem; color: #c9a03d; }
        input, select, textarea {
            width: 100%;
            padding: 12px;
            background: rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            color: #fff;
        }
        textarea { min-height: 120px; font-family: monospace; }
        button {
            padding: 12px 24px;
            background: linear-gradient(135deg, #5c1a1b, #3a0f10);
            color: white;
            border: none;
            border-radius: 40px;
            cursor: pointer;
            font-weight: 600;
        }
        .btn-full { width: 100%; margin-top: 10px; }
        .cv-output {
            background: rgba(0,0,0,0.5);
            border-radius: 16px;
            padding: 20px;
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 13px;
            max-height: 400px;
            overflow-y: auto;
        }
        .error-message { color: #e74c3c; background: rgba(231,76,60,0.2); padding: 12px; border-radius: 12px; }
        .empty-state { text-align: center; padding: 40px; color: #666; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>CareerCraft <span class="gradient-text">AI</span></h1>
        <div class="tagline">Your professional identity. Any country. Instantly.</div>
    </div>

    <div class="grid">
        <div class="card">
            <h3>📝 Your Information</h3>
            <div class="form-group">
                <label>🌍 Target Country</label>
                <select id="country">
                    <option value="USA">🇺🇸 USA</option>
                    <option value="UK">🇬🇧 UK</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="Australia">🇦🇺 Australia</option>
                    <option value="Japan">🇯🇵 Japan</option>
                    <option value="NZ">🇳🇿 New Zealand</option>
                </select>
            </div>
            <div class="form-group">
                <label>👤 Full Name</label>
                <input type="text" id="fullName" placeholder="Jane Smith">
            </div>
            <div class="form-group">
                <label>📄 Your Experience</label>
                <textarea id="experience" placeholder="Marketing Manager at TechCorp (2021-2024)&#10;Increased engagement by 150%&#10;Led team of 4"></textarea>
            </div>
            <button id="generateBtn" class="btn-full">✨ Generate CV</button>
        </div>

        <div class="card">
            <h3>📄 Your CV</h3>
            <div id="output" class="cv-output"><div class="empty-state">Your CV will appear here</div></div>
            <button id="copyBtn" style="margin-top: 10px;">📋 Copy</button>
        </div>
    </div>
</div>

<script>
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const output = document.getElementById('output');
    const countrySelect = document.getElementById('country');
    const fullNameInput = document.getElementById('fullName');
    const experienceInput = document.getElementById('experience');

    async function generateCV() {
        const exp = experienceInput.value.trim();
        if (exp.length < 10) {
            output.innerHTML = '<div class="error-message">⚠️ Please provide your experience.</div>';
            return;
        }
        
        output.innerHTML = '<div class="empty-state">⏳ Generating your CV...</div>';
        generateBtn.disabled = true;
        
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    experience: exp,
                    country: countrySelect.value,
                    name: fullNameInput.value || 'Professional'
                })
            });
            
            const data = await res.json();
            if (data.success) {
                output.innerHTML = data.cv.replace(/\\n/g, '<br>');
            } else {
                output.innerHTML = '<div class="error-message">Error: ' + (data.error || 'Try again') + '</div>';
            }
        } catch (error) {
            output.innerHTML = '<div class="error-message">Network error. Please try again.</div>';
        }
        generateBtn.disabled = false;
    }

    function copyCV() {
        const text = output.innerText;
        if (text && text !== 'Your CV will appear here' && !text.includes('Generating')) {
            navigator.clipboard.writeText(text);
            alert('✓ CV copied!');
        } else {
            alert('Generate a CV first.');
        }
    }

    generateBtn.addEventListener('click', generateCV);
    copyBtn.addEventListener('click', copyCV);
</script>
</body>
</html>`;

app.get('/', (req, res) => {
    res.send(html);
});

app.post('/api/generate', async (req, res) => {
    const { experience, country, name } = req.body;
    
    const prompts = {
        USA: "Generate a 1-page professional resume. Use action verbs and metrics.",
        UK: "Generate a professional CV. Use British spelling. Understated tone.",
        Canada: "Generate a resume. Include teamwork examples.",
        Australia: "Generate a CV. Be practical and direct.",
        Japan: "Generate a Rirekisho format. Include photo placeholder. Be humble.",
        NZ: "Generate a CV. Be practical and down-to-earth."
    };
    
    const dummyCV = `${name || 'Professional Candidate'}\n================================\n\nPROFESSIONAL SUMMARY\nExperienced professional targeting ${country} market.\n\nWORK EXPERIENCE\n${experience}\n\nKey achievements:\n• Delivered measurable results\n• Led cross-functional teams  \n• Improved efficiency by 25%\n\nEDUCATION\nBachelor's Degree in Related Field\n\nSKILLS\nLeadership • Communication • Problem Solving`;
    
    res.json({ success: true, cv: dummyCV });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
