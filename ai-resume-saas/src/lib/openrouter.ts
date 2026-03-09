export async function generateAI(prompt: string) {
    const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    { role: 'user', content: prompt }
                ],
            }),
        }
    )

    if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', errorText);
        throw new Error(`OpenRouter API failed: ${response.statusText}`);
    }

    const data = await response.json()

    if (!data.choices || data.choices.length === 0) {
        console.error('OpenRouter returned no choices:', data);
        throw new Error('OpenRouter returned no content');
    }

    return data.choices[0].message.content as string
}
