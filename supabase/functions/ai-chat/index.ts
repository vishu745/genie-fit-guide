import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userProfile, recentWorkouts, recentMeals } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context-aware system prompt
    let systemPrompt = `You are Fitgenix AI Coach, an expert fitness and nutrition advisor. You're energetic, supportive, and provide personalized recommendations.

You have access to the user's profile and recent activity:`;

    if (userProfile) {
      systemPrompt += `\n\nUser Profile:
- Name: ${userProfile.first_name} ${userProfile.last_name}
- Age: ${userProfile.age || 'Not specified'}
- Sex: ${userProfile.sex || 'Not specified'}
- Height: ${userProfile.height || 'Not specified'} cm
- Weight: ${userProfile.weight || 'Not specified'} kg
- Activity Level: ${userProfile.activity_level || 'Not specified'}
- Goal: ${userProfile.goal || 'Not specified'}`;
    }

    if (recentWorkouts && recentWorkouts.length > 0) {
      systemPrompt += `\n\nRecent Workouts (last 7 days):`;
      recentWorkouts.forEach((workout: any) => {
        systemPrompt += `\n- ${workout.date}: ${workout.total_calories} calories burned, ${workout.total_duration} minutes`;
      });
    }

    if (recentMeals && recentMeals.length > 0) {
      systemPrompt += `\n\nRecent Meals (last 7 days):`;
      recentMeals.forEach((meal: any) => {
        systemPrompt += `\n- ${meal.date} (${meal.meal_type}): ${meal.total_calories} calories, ${meal.total_protein}g protein`;
      });
    }

    systemPrompt += `\n\nProvide helpful, actionable advice. Be encouraging and specific. If asked about workouts or meal plans, provide detailed, personalized recommendations based on their profile and goals.`;

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limits exceeded. Please try again later.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits depleted. Please add credits to continue.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});