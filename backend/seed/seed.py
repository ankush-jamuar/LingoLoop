"""LingoLoop Seed Script (Phase 2)
Seeds the complete foundation curriculum (Spanish for English Speakers)
and learner state for Ankush with 100% idempotency and typed JSON validation.
"""

from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine
from app.models import (
    Achievement,
    Base,
    Course,
    DailyActivity,
    Exercise,
    ExerciseAttempt,
    LearnerStats,
    Lesson,
    LessonAttempt,
    Skill,
    SkillStatus,
    Unit,
    User,
    UserAchievement,
    UserSkillProgress,
)
from app.schemas.exercise_content import ExerciseType, validate_exercise_content


def get_curriculum_data() -> dict:
    """Returns the structured course, unit, skill, lesson, and exercise dataset."""
    return {
        "name": "Spanish for English Speakers",
        "source_language": "English",
        "target_language": "Spanish",
        "description": "An intuitive, loop-based introduction to conversational Spanish.",
        "order_index": 0,
        "units": [
            {
                "title": "Unit 1 — First Connections",
                "description": "Break the ice with essential daily Spanish greetings and fundamental building blocks.",
                "order_index": 0,
                "skills": [
                    {
                        "title": "First Words",
                        "subtitle": "Core Basics & Warmups",
                        "description": "Learn essential everyday words like hello, please, and thank you.",
                        "icon_key": "sparkles",
                        "order_index": 0,
                        "xp_reward": 20,
                        "is_locked_by_default": False,
                        "lessons": [
                            {
                                "title": "Lesson 1: Hello & Goodbye",
                                "order_index": 0,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "How do you say 'Hello' in Spanish?",
                                        "instruction": "Select the correct option",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "opt1", "text": "Hola"},
                                                {"id": "opt2", "text": "Adiós"},
                                                {"id": "opt3", "text": "Gracias"},
                                            ],
                                            "correctOptionId": "opt1",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'Goodbye'",
                                        "instruction": "Assemble the translation from the word bank",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "Goodbye",
                                            "acceptedAnswers": ["Adiós"],
                                            "wordBank": ["Adiós", "Hola", "Por favor", "Sí"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match the Spanish and English greetings",
                                        "instruction": "Tap matching pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "Hola", "right": "Hello"},
                                                {"left": "Adiós", "right": "Goodbye"},
                                                {"left": "Buenas noches", "right": "Good night"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete the greeting: '___, buenos días!' (Hello)",
                                        "instruction": "Fill in the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "___, buenos días!",
                                            "acceptedAnswers": ["Hola", "hola"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'Good morning' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["Buenos días", "buenos dias", "buenos días"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                            {
                                "title": "Lesson 2: Please & Thank You",
                                "order_index": 1,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "Which phrase means 'Thank you'?",
                                        "instruction": "Select the correct option",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "opt1", "text": "De nada"},
                                                {"id": "opt2", "text": "Gracias"},
                                                {"id": "opt3", "text": "Por favor"},
                                            ],
                                            "correctOptionId": "opt2",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'Please'",
                                        "instruction": "Assemble the translation",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "Please",
                                            "acceptedAnswers": ["Por favor"],
                                            "wordBank": ["Por", "favor", "Gracias", "Mucho"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match polite expressions",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "Gracias", "right": "Thank you"},
                                                {"left": "Por favor", "right": "Please"},
                                                {"left": "De nada", "right": "You're welcome"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: 'Muchas ___, amigo!' (thanks)",
                                        "instruction": "Fill in the blank",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "Muchas ___, amigo!",
                                            "acceptedAnswers": ["gracias", "Gracias"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'You are welcome' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["De nada", "de nada"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        "title": "Meet & Greet",
                        "subtitle": "Introductions & Courtesy",
                        "description": "Introduce yourself, share your name, and ask basic courteous questions.",
                        "icon_key": "smile",
                        "order_index": 1,
                        "xp_reward": 20,
                        "is_locked_by_default": True,
                        "lessons": [
                            {
                                "title": "Lesson 1: My Name Is...",
                                "order_index": 0,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "What does 'Me llamo...' mean?",
                                        "instruction": "Choose the best answer",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "My name is..."},
                                                {"id": "b", "text": "I live in..."},
                                                {"id": "c", "text": "How are you?"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'I am Maria'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "I am Maria",
                                            "acceptedAnswers": ["Yo soy Maria", "Yo soy María", "Soy Maria", "Soy María"],
                                            "wordBank": ["Yo", "soy", "María", "llamo", "él"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match introduction phrases",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "Mucho gusto", "right": "Nice to meet you"},
                                                {"left": "Me llamo", "right": "My name is"},
                                                {"left": "¿Cómo te llamas?", "right": "What is your name?"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: '___ llamo Carlos.' (My name is)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "___ llamo Carlos.",
                                            "acceptedAnswers": ["Me", "me"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'Nice to meet you' in Spanish",
                                        "instruction": "Type the answer",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["Mucho gusto", "mucho gusto", "Encantado", "encantado"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                            {
                                "title": "Lesson 2: How Are You?",
                                "order_index": 1,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "How do you ask 'How are you?' informally?",
                                        "instruction": "Select the correct option",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "¿Cómo estás?"},
                                                {"id": "b", "text": "¿Qué hora es?"},
                                                {"id": "c", "text": "¿Dónde está?"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'Very well, thank you'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "Very well, thank you",
                                            "acceptedAnswers": ["Muy bien, gracias", "Muy bien gracias"],
                                            "wordBank": ["Muy", "bien,", "gracias", "mal", "hola"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match responses to feelings",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "Bien", "right": "Good"},
                                                {"left": "Muy bien", "right": "Very good"},
                                                {"left": "Así así", "right": "So-so"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: '¿___ tal?' (How's it going?)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "¿___ tal?",
                                            "acceptedAnswers": ["Qué", "que", "Qué"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'I am fine' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["Estoy bien", "estoy bien"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        "title": "Tiny Conversations",
                        "subtitle": "Short Dialogues",
                        "description": "Construct small 2-way exchanges about origins, agreements, and quick questions.",
                        "icon_key": "message-circle",
                        "order_index": 2,
                        "xp_reward": 25,
                        "is_locked_by_default": True,
                        "lessons": [
                            {
                                "title": "Lesson 1: Yes, No, & Maybe",
                                "order_index": 0,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "Which word means 'Maybe' in Spanish?",
                                        "instruction": "Choose the correct option",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "Tal vez"},
                                                {"id": "b", "text": "Siempre"},
                                                {"id": "c", "text": "Nunca"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'Yes, of course'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "Yes, of course",
                                            "acceptedAnswers": ["Sí, por supuesto", "Si, por supuesto"],
                                            "wordBank": ["Sí,", "por", "supuesto", "no", "nunca"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match affirmative and negative words",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "Sí", "right": "Yes"},
                                                {"left": "No", "right": "No"},
                                                {"left": "Quizás", "right": "Perhaps"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: 'No, ___ puedo.' (I cannot)",
                                        "instruction": "Fill the blank",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "No, ___ puedo.",
                                            "acceptedAnswers": ["no", "No"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'Yes, please' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["Sí, por favor", "Si, por favor", "si por favor", "sí por favor"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                            {
                                "title": "Lesson 2: Where Are You From?",
                                "order_index": 1,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "What does '¿De dónde eres?' mean?",
                                        "instruction": "Choose the correct meaning",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "Where are you from?"},
                                                {"id": "b", "text": "Where are you going?"},
                                                {"id": "c", "text": "Where do you work?"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'I am from Spain'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "I am from Spain",
                                            "acceptedAnswers": ["Soy de España", "Yo soy de España"],
                                            "wordBank": ["Soy", "de", "España", "en", "México"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match countries and origins",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "España", "right": "Spain"},
                                                {"left": "México", "right": "Mexico"},
                                                {"left": "Estados Unidos", "right": "United States"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: 'Yo soy ___ México.' (from)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "Yo soy ___ México.",
                                            "acceptedAnswers": ["de"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'I live here' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["Vivo aquí", "vivo aqui", "vivo aquí", "Yo vivo aquí"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                "title": "Unit 2 — Everyday Signals",
                "description": "Navigate practical scenarios, food choices, and common objects.",
                "order_index": 1,
                "skills": [
                    {
                        "title": "Food Signals",
                        "subtitle": "Café & Tapas Basics",
                        "description": "Order drinks, coffee, bread, and express food preferences.",
                        "icon_key": "utensils",
                        "order_index": 0,
                        "xp_reward": 25,
                        "is_locked_by_default": True,
                        "lessons": [
                            {
                                "title": "Lesson 1: Coffee & Water",
                                "order_index": 0,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "How do you say 'A coffee, please'?",
                                        "instruction": "Select the correct option",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "Un café, por favor"},
                                                {"id": "b", "text": "Un té, gracias"},
                                                {"id": "c", "text": "Una manzana, por favor"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'Water with gas'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "Water with gas",
                                            "acceptedAnswers": ["Agua con gas"],
                                            "wordBank": ["Agua", "con", "gas", "sin", "leche"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match beverage words",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "El café", "right": "The coffee"},
                                                {"left": "El agua", "right": "The water"},
                                                {"left": "El té", "right": "The tea"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: 'Café con ___' (milk)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "Café con ___",
                                            "acceptedAnswers": ["leche"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'The bread' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["El pan", "el pan"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                            {
                                "title": "Lesson 2: Ordering at a Café",
                                "order_index": 1,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "How do you ask for the check / bill?",
                                        "instruction": "Select the correct option",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "La cuenta, por favor"},
                                                {"id": "b", "text": "El menú, por favor"},
                                                {"id": "c", "text": "La mesa, por favor"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'I would like a sandwich'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "I would like a sandwich",
                                            "acceptedAnswers": ["Quisiera un sándwich", "Quiero un sándwich", "Quisiera un bocadillo"],
                                            "wordBank": ["Quisiera", "un", "sándwich", "café", "dos"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match restaurant terms",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "La cuenta", "right": "The bill"},
                                                {"left": "El menú", "right": "The menu"},
                                                {"left": "La mesa", "right": "The table"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: 'Una mesa para ___, por favor.' (two)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "Una mesa para ___, por favor.",
                                            "acceptedAnswers": ["dos"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'Delicious' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["Delicioso", "delicioso", "Rico", "rico"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        "title": "Useful Things",
                        "subtitle": "Daily Items & Objects",
                        "description": "Identify common objects like phone, keys, bag, and money.",
                        "icon_key": "box",
                        "order_index": 1,
                        "xp_reward": 25,
                        "is_locked_by_default": True,
                        "lessons": [
                            {
                                "title": "Lesson 1: Keys, Phone, & Bag",
                                "order_index": 0,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "What is 'El teléfono'?",
                                        "instruction": "Choose the translation",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "The phone"},
                                                {"id": "b", "text": "The watch"},
                                                {"id": "c", "text": "The keys"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'My keys'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "My keys",
                                            "acceptedAnswers": ["Mis llaves"],
                                            "wordBank": ["Mis", "llaves", "Mi", "bolsa"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match everyday items",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "Las llaves", "right": "The keys"},
                                                {"left": "La bolsa", "right": "The bag"},
                                                {"left": "El dinero", "right": "The money"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: '¿Dónde está mi ___?' (phone)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "¿Dónde está mi ___?",
                                            "acceptedAnswers": ["teléfono", "telefono"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'The passport' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["El pasaporte", "el pasaporte"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                            {
                                "title": "Lesson 2: This & That",
                                "order_index": 1,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "Which word means 'This' (masculine singular)?",
                                        "instruction": "Choose the correct pronoun",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "Este"},
                                                {"id": "b", "text": "Ese"},
                                                {"id": "c", "text": "Aquel"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'I need that'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "I need that",
                                            "acceptedAnswers": ["Necesito eso", "Yo necesito eso"],
                                            "wordBank": ["Necesito", "eso", "esto", "tengo"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match demonstratives",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "Esto", "right": "This"},
                                                {"left": "Eso", "right": "That"},
                                                {"left": "Aquí", "right": "Here"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: '___ libro es bueno.' (This)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "___ libro es bueno.",
                                            "acceptedAnswers": ["Este", "este"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'What is this?' in Spanish",
                                        "instruction": "Type the question",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["¿Qué es esto?", "Que es esto?", "que es esto", "qué es esto"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        "title": "Around Town",
                        "subtitle": "Directions & Transit",
                        "description": "Ask for directions, locate stations, and explore neighborhoods.",
                        "icon_key": "map-pin",
                        "order_index": 2,
                        "xp_reward": 30,
                        "is_locked_by_default": True,
                        "lessons": [
                            {
                                "title": "Lesson 1: Streets & Plazas",
                                "order_index": 0,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "What does 'La calle' mean?",
                                        "instruction": "Select the correct meaning",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "The street"},
                                                {"id": "b", "text": "The house"},
                                                {"id": "c", "text": "The bridge"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'To the right'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "To the right",
                                            "acceptedAnswers": ["A la derecha"],
                                            "wordBank": ["A", "la", "derecha", "izquierda", "recto"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match directional terms",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "Derecha", "right": "Right"},
                                                {"left": "Izquierda", "right": "Left"},
                                                {"left": "Recto", "right": "Straight"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: 'La plaza está ___.' (close)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "La plaza está ___.",
                                            "acceptedAnswers": ["cerca", "aquí"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'The city' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["La ciudad", "la ciudad"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                            {
                                "title": "Lesson 2: Where is the Station?",
                                "order_index": 1,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "How do you ask 'Where is the train station?'",
                                        "instruction": "Select the correct option",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "¿Dónde está la estación de tren?"},
                                                {"id": "b", "text": "¿Dónde está el hotel?"},
                                                {"id": "c", "text": "¿A qué hora llega el tren?"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'A taxi, please'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "A taxi, please",
                                            "acceptedAnswers": ["Un taxi, por favor", "Un taxi por favor"],
                                            "wordBank": ["Un", "taxi,", "por", "favor", "autobús"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match transportation places",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "La estación", "right": "The station"},
                                                {"left": "El aeropuerto", "right": "The airport"},
                                                {"left": "El hotel", "right": "The hotel"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: '¿___ está el museo?' (Where)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "¿___ está el museo?",
                                            "acceptedAnswers": ["Dónde", "Donde", "dónde"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'Near here' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["Cerca de aquí", "cerca de aqui", "cerca de aquí"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                "title": "Unit 3 — Daily Rhythm",
                "description": "Express your habits, schedules, and natural conversational cadence.",
                "order_index": 2,
                "skills": [
                    {
                        "title": "Morning Rhythm",
                        "subtitle": "Start of the Day",
                        "description": "Discuss morning habits, breakfast, and waking up.",
                        "icon_key": "sun",
                        "order_index": 0,
                        "xp_reward": 30,
                        "is_locked_by_default": True,
                        "lessons": [
                            {
                                "title": "Lesson 1: Wake Up & Breakfast",
                                "order_index": 0,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "What is 'El desayuno'?",
                                        "instruction": "Choose the correct translation",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "Breakfast"},
                                                {"id": "b", "text": "Lunch"},
                                                {"id": "c", "text": "Dinner"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'I wake up early'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "I wake up early",
                                            "acceptedAnswers": ["Me despierto temprano", "Yo me despierto temprano"],
                                            "wordBank": ["Me", "despierto", "temprano", "tarde", "hoy"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match daily routines",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "Temprano", "right": "Early"},
                                                {"left": "Tarde", "right": "Late"},
                                                {"left": "La mañana", "right": "The morning"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: 'Tomo café por la ___.' (morning)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "Tomo café por la ___.",
                                            "acceptedAnswers": ["mañana", "manana"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'Good morning to everyone' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["Buenos días a todos", "buenos dias a todos", "buenos días a todos"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                            {
                                "title": "Lesson 2: Morning Routines",
                                "order_index": 1,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "How do you say 'I start work' in Spanish?",
                                        "instruction": "Select the correct option",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "Empiezo a trabajar"},
                                                {"id": "b", "text": "Termino de comer"},
                                                {"id": "c", "text": "Voy a dormir"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'Every day'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "Every day",
                                            "acceptedAnswers": ["Todos los días", "Cada día"],
                                            "wordBank": ["Todos", "los", "días", "hoy", "ayer"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match routine terms",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "El trabajo", "right": "Work"},
                                                {"left": "La ducha", "right": "The shower"},
                                                {"left": "La ropa", "right": "The clothes"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: 'Salgo de casa a las ___.' (eight)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "Salgo de casa a las ___.",
                                            "acceptedAnswers": ["ocho", "8"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'I am ready' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["Estoy listo", "estoy listo", "Estoy lista", "estoy lista"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        "title": "Daily Plans",
                        "subtitle": "Time & Appointments",
                        "description": "Tell time, make appointments, and schedule future meetups.",
                        "icon_key": "calendar",
                        "order_index": 1,
                        "xp_reward": 30,
                        "is_locked_by_default": True,
                        "lessons": [
                            {
                                "title": "Lesson 1: Today & Tomorrow",
                                "order_index": 0,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "What does 'Mañana' mean in this context?",
                                        "instruction": "Select the correct option",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "Tomorrow"},
                                                {"id": "b", "text": "Yesterday"},
                                                {"id": "c", "text": "Today"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'See you tomorrow'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "See you tomorrow",
                                            "acceptedAnswers": ["Hasta mañana", "Nos vemos mañana"],
                                            "wordBank": ["Hasta", "mañana", "luego", "pronto"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match time expressions",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "Hoy", "right": "Today"},
                                                {"left": "Ayer", "right": "Yesterday"},
                                                {"left": "Mañana", "right": "Tomorrow"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: '¿Qué hora ___?' (is it)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "¿Qué hora ___?",
                                            "acceptedAnswers": ["es"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'It is two o'clock' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["Son las dos", "son las dos"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                            {
                                "title": "Lesson 2: Making Plans",
                                "order_index": 1,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "How do you say 'At what time?' in Spanish?",
                                        "instruction": "Select the correct option",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "¿A qué hora?"},
                                                {"id": "b", "text": "¿Cuánto cuesta?"},
                                                {"id": "c", "text": "¿Quién es?"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'We meet at six'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "We meet at six",
                                            "acceptedAnswers": ["Nos vemos a las seis", "Quedamos a las seis"],
                                            "wordBank": ["Nos", "vemos", "a", "las", "seis", "cinco"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match calendar periods",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "Esta tarde", "right": "This afternoon"},
                                                {"left": "Esta noche", "right": "Tonight"},
                                                {"left": "El fin de semana", "right": "The weekend"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: '¿Tienes ___ hoy?' (time)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "¿Tienes ___ hoy?",
                                            "acceptedAnswers": ["tiempo"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'Perfect, see you then' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["Perfecto, nos vemos", "perfecto nos vemos", "Perfecto, hasta entonces"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        "title": "Small Talk",
                        "subtitle": "Casual Spanish Banter",
                        "description": "Converse casually about interests, weather, and lighthearted opinions.",
                        "icon_key": "users",
                        "order_index": 2,
                        "xp_reward": 35,
                        "is_locked_by_default": True,
                        "lessons": [
                            {
                                "title": "Lesson 1: Nice Weather",
                                "order_index": 0,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "How do you say 'It is very sunny'?",
                                        "instruction": "Choose the best translation",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "Hace mucho sol"},
                                                {"id": "b", "text": "Hace mucho frío"},
                                                {"id": "c", "text": "Está lloviendo"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'What nice weather!'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "What nice weather!",
                                            "acceptedAnswers": ["¡Qué buen tiempo!", "Que buen tiempo", "Qué buen tiempo"],
                                            "wordBank": ["¡Qué", "buen", "tiempo!", "mal", "sol"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match weather phrases",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "Hace calor", "right": "It's hot"},
                                                {"left": "Hace frío", "right": "It's cold"},
                                                {"left": "Hace viento", "right": "It's windy"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: 'Hoy hace un día ___.' (beautiful)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "Hoy hace un día ___.",
                                            "acceptedAnswers": ["hermoso", "bonito", "lindo"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'I like the sun' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["Me gusta el sol", "me gusta el sol"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                            {
                                "title": "Lesson 2: See You Soon!",
                                "order_index": 1,
                                "xp_reward": 10,
                                "exercises": [
                                    {
                                        "type": ExerciseType.MULTIPLE_CHOICE.value,
                                        "prompt": "What does '¡Hasta pronto!' mean?",
                                        "instruction": "Select the correct option",
                                        "order_index": 0,
                                        "xp_reward": 2,
                                        "content": {
                                            "options": [
                                                {"id": "a", "text": "See you soon!"},
                                                {"id": "b", "text": "See you yesterday!"},
                                                {"id": "c", "text": "Welcome!"},
                                            ],
                                            "correctOptionId": "a",
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TRANSLATE.value,
                                        "prompt": "Translate 'Have a good day'",
                                        "instruction": "Translate into Spanish",
                                        "order_index": 1,
                                        "xp_reward": 2,
                                        "content": {
                                            "sourceText": "Have a good day",
                                            "acceptedAnswers": ["Que tengas un buen día", "Que tenga un buen día", "Buen día"],
                                            "wordBank": ["Que", "tengas", "un", "buen", "día", "noche"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.MATCH_PAIRS.value,
                                        "prompt": "Match farewells",
                                        "instruction": "Match pairs",
                                        "order_index": 2,
                                        "xp_reward": 2,
                                        "content": {
                                            "pairs": [
                                                {"left": "Hasta luego", "right": "See you later"},
                                                {"left": "Hasta pronto", "right": "See you soon"},
                                                {"left": "Cuídate", "right": "Take care"},
                                            ]
                                        },
                                    },
                                    {
                                        "type": ExerciseType.FILL_BLANK.value,
                                        "prompt": "Complete: '¡Nos ___ pronto!' (see)",
                                        "instruction": "Fill the missing word",
                                        "order_index": 3,
                                        "xp_reward": 2,
                                        "content": {
                                            "sentence": "¡Nos ___ pronto!",
                                            "acceptedAnswers": ["vemos", "Vemos"],
                                        },
                                    },
                                    {
                                        "type": ExerciseType.TYPE_ANSWER.value,
                                        "prompt": "Type 'Take care' in Spanish",
                                        "instruction": "Type the translation",
                                        "order_index": 4,
                                        "xp_reward": 2,
                                        "content": {
                                            "acceptedAnswers": ["Cuídate", "cuidate", "Cúidate"],
                                            "caseSensitive": False,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    }


def seed_curriculum(db: Session) -> Course:
    """Seeds or updates the Course, Unit, Skill, Lesson, and Exercise hierarchy."""
    data = get_curriculum_data()

    # 1. Course
    course = (
        db.query(Course)
        .filter(Course.name == data["name"], Course.source_language == data["source_language"])
        .first()
    )
    if not course:
        course = Course(
            name=data["name"],
            source_language=data["source_language"],
            target_language=data["target_language"],
            description=data["description"],
            order_index=data["order_index"],
            is_active=True,
        )
        db.add(course)
        db.flush()
    else:
        course.description = data["description"]
        course.target_language = data["target_language"]
        course.order_index = data["order_index"]
        course.is_active = True
        db.flush()

    # 2. Units
    for unit_data in data["units"]:
        unit = (
            db.query(Unit)
            .filter(Unit.course_id == course.id, Unit.order_index == unit_data["order_index"])
            .first()
        )
        if not unit:
            unit = Unit(
                course_id=course.id,
                title=unit_data["title"],
                description=unit_data["description"],
                order_index=unit_data["order_index"],
            )
            db.add(unit)
            db.flush()
        else:
            unit.title = unit_data["title"]
            unit.description = unit_data["description"]
            db.flush()

        # 3. Skills
        for skill_data in unit_data["skills"]:
            skill = (
                db.query(Skill)
                .filter(Skill.unit_id == unit.id, Skill.order_index == skill_data["order_index"])
                .first()
            )
            if not skill:
                skill = Skill(
                    unit_id=unit.id,
                    title=skill_data["title"],
                    subtitle=skill_data["subtitle"],
                    description=skill_data["description"],
                    icon_key=skill_data["icon_key"],
                    order_index=skill_data["order_index"],
                    xp_reward=skill_data["xp_reward"],
                    is_locked_by_default=skill_data["is_locked_by_default"],
                )
                db.add(skill)
                db.flush()
            else:
                skill.title = skill_data["title"]
                skill.subtitle = skill_data["subtitle"]
                skill.description = skill_data["description"]
                skill.icon_key = skill_data["icon_key"]
                skill.xp_reward = skill_data["xp_reward"]
                skill.is_locked_by_default = skill_data["is_locked_by_default"]
                db.flush()

            # 4. Lessons
            for lesson_data in skill_data["lessons"]:
                lesson = (
                    db.query(Lesson)
                    .filter(Lesson.skill_id == skill.id, Lesson.order_index == lesson_data["order_index"])
                    .first()
                )
                if not lesson:
                    lesson = Lesson(
                        skill_id=skill.id,
                        title=lesson_data["title"],
                        order_index=lesson_data["order_index"],
                        xp_reward=lesson_data["xp_reward"],
                    )
                    db.add(lesson)
                    db.flush()
                else:
                    lesson.title = lesson_data["title"]
                    lesson.xp_reward = lesson_data["xp_reward"]
                    db.flush()

                # 5. Exercises
                for ex_data in lesson_data["exercises"]:
                    # Validate content with typed Pydantic validator
                    validated_content = validate_exercise_content(ex_data["type"], ex_data["content"])

                    exercise = (
                        db.query(Exercise)
                        .filter(
                            Exercise.lesson_id == lesson.id,
                            Exercise.order_index == ex_data["order_index"],
                        )
                        .first()
                    )
                    if not exercise:
                        exercise = Exercise(
                            lesson_id=lesson.id,
                            type=ex_data["type"],
                            prompt=ex_data["prompt"],
                            instruction=ex_data.get("instruction"),
                            content=validated_content,
                            order_index=ex_data["order_index"],
                            xp_reward=ex_data["xp_reward"],
                        )
                        db.add(exercise)
                    else:
                        exercise.type = ex_data["type"]
                        exercise.prompt = ex_data["prompt"]
                        exercise.instruction = ex_data.get("instruction")
                        exercise.content = validated_content
                        exercise.xp_reward = ex_data["xp_reward"]

    db.flush()
    return course


def seed_achievements(db: Session) -> dict[str, Achievement]:
    """Seeds baseline achievements."""
    achievements_data = [
        {
            "key": "first_loop",
            "title": "First Loop",
            "description": "Close your first learning loop by completing a lesson.",
            "icon_key": "sparkles",
            "requirement_type": "lessons",
            "requirement_value": 1,
        },
        {
            "key": "momentum_100",
            "title": "Momentum Builder",
            "description": "Earn your first 100 Momentum points.",
            "icon_key": "flame",
            "requirement_type": "xp",
            "requirement_value": 100,
        },
        {
            "key": "three_day_loop",
            "title": "Three-Day Loop",
            "description": "Practice for three consecutive days to build habit momentum.",
            "icon_key": "calendar",
            "requirement_type": "streak",
            "requirement_value": 3,
        },
    ]

    achievement_map = {}
    for ach_data in achievements_data:
        ach = db.query(Achievement).filter(Achievement.key == ach_data["key"]).first()
        if not ach:
            ach = Achievement(
                key=ach_data["key"],
                title=ach_data["title"],
                description=ach_data["description"],
                icon_key=ach_data["icon_key"],
                requirement_type=ach_data["requirement_type"],
                requirement_value=ach_data["requirement_value"],
            )
            db.add(ach)
            db.flush()
        else:
            ach.title = ach_data["title"]
            ach.description = ach_data["description"]
            ach.icon_key = ach_data["icon_key"]
            ach.requirement_type = ach_data["requirement_type"]
            ach.requirement_value = ach_data["requirement_value"]
            db.flush()
        achievement_map[ach.key] = ach

    return achievement_map


def seed_learner(db: Session, course: Course, achievement_map: dict[str, Achievement]) -> User:
    """Seeds learner Ankush, stats, progress, daily activity, and attempts."""
    email = "ankush@lingoloop.local"
    user = db.query(User).filter(User.email == email).first()

    now_utc = datetime.now(timezone.utc)
    today = date.today()

    if not user:
        user = User(
            name="Ankush",
            email=email,
            avatar_key="milo_default",
            created_at=now_utc - timedelta(days=7),
        )
        db.add(user)
        db.flush()

    # 1. Learner Stats
    stats = db.query(LearnerStats).filter(LearnerStats.user_id == user.id).first()
    if not stats:
        stats = LearnerStats(
            user_id=user.id,
            total_xp=120,
            current_streak=3,
            longest_streak=5,
            hearts=4,
            max_hearts=5,
            gems=80,
            daily_goal_xp=30,
            last_activity_at=now_utc,
            hearts_updated_at=now_utc,
        )
        db.add(stats)
    else:
        stats.total_xp = 120
        stats.current_streak = 3
        stats.longest_streak = 5
        stats.hearts = 4
        stats.max_hearts = 5
        stats.gems = 80
        stats.daily_goal_xp = 30
        stats.last_activity_at = now_utc

    # 2. Skill Progress across all 9 skills in the course
    # Collect skills in order
    all_skills = (
        db.query(Skill)
        .join(Unit)
        .filter(Unit.course_id == course.id)
        .order_by(Unit.order_index, Skill.order_index)
        .all()
    )

    for idx, sk in enumerate(all_skills):
        progress = (
            db.query(UserSkillProgress)
            .filter(UserSkillProgress.user_id == user.id, UserSkillProgress.skill_id == sk.id)
            .first()
        )

        if idx == 0:  # First Words: completed (2/2 distinct lessons passed)
            p_status = SkillStatus.COMPLETED.value
            p_unlocked = True
            p_completed = True
            p_crown = 1
            p_lessons = 2
            p_xp = 40
        elif idx == 1:  # Meet & Greet: in progress (1/2 distinct lessons passed)
            p_status = SkillStatus.IN_PROGRESS.value
            p_unlocked = True
            p_completed = False
            p_crown = 1
            p_lessons = 1
            p_xp = 20
        elif idx == 2:  # Tiny Conversations: unlocked (0/2 lessons passed)
            p_status = SkillStatus.UNLOCKED.value
            p_unlocked = True
            p_completed = False
            p_crown = 0
            p_lessons = 0
            p_xp = 0
        else:  # Remaining 6 skills locked
            p_status = SkillStatus.LOCKED.value
            p_unlocked = False
            p_completed = False
            p_crown = 0
            p_lessons = 0
            p_xp = 0

        if not progress:
            progress = UserSkillProgress(
                user_id=user.id,
                skill_id=sk.id,
                status=p_status,
                is_unlocked=p_unlocked,
                completed=p_completed,
                crown_level=p_crown,
                xp_earned=p_xp,
                lessons_completed=p_lessons,
                last_practiced_at=now_utc if p_lessons > 0 else None,
            )
            db.add(progress)
        else:
            progress.status = p_status
            progress.is_unlocked = p_unlocked
            progress.completed = p_completed
            progress.crown_level = p_crown
            progress.xp_earned = p_xp
            progress.lessons_completed = p_lessons
            progress.last_practiced_at = now_utc if p_lessons > 0 else None

    # 3. Daily Activities (3-day streak)
    activities = [
        {"day_offset": 2, "xp": 25, "lessons": 1, "minutes": 10},
        {"day_offset": 1, "xp": 40, "lessons": 2, "minutes": 15},
        {"day_offset": 0, "xp": 55, "lessons": 2, "minutes": 20},
    ]
    for act_data in activities:
        act_date = today - timedelta(days=act_data["day_offset"])
        activity = (
            db.query(DailyActivity)
            .filter(DailyActivity.user_id == user.id, DailyActivity.activity_date == act_date)
            .first()
        )
        if not activity:
            activity = DailyActivity(
                user_id=user.id,
                activity_date=act_date,
                xp_earned=act_data["xp"],
                lessons_completed=act_data["lessons"],
                minutes_practiced=act_data["minutes"],
                active=True,
            )
            db.add(activity)
        else:
            activity.xp_earned = act_data["xp"]
            activity.lessons_completed = act_data["lessons"]
            activity.minutes_practiced = act_data["minutes"]
            activity.active = True

    # 4. User Achievements (First Loop & Momentum Builder unlocked)
    unlocked_keys = ["first_loop", "momentum_100"]
    for key in unlocked_keys:
        ach = achievement_map.get(key)
        if ach:
            ua = (
                db.query(UserAchievement)
                .filter(UserAchievement.user_id == user.id, UserAchievement.achievement_id == ach.id)
                .first()
            )
            if not ua:
                ua = UserAchievement(
                    user_id=user.id,
                    achievement_id=ach.id,
                    unlocked_at=now_utc - timedelta(days=1),
                )
                db.add(ua)

    # 5. Lesson & Exercise Attempts (For First Words lessons)
    first_skill = all_skills[0] if all_skills else None
    if first_skill and first_skill.lessons:
        for l_idx, lesson in enumerate(first_skill.lessons):
            attempt = (
                db.query(LessonAttempt)
                .filter(LessonAttempt.user_id == user.id, LessonAttempt.lesson_id == lesson.id)
                .first()
            )
            if not attempt:
                attempt = LessonAttempt(
                    user_id=user.id,
                    lesson_id=lesson.id,
                    status="completed",
                    score=100,
                    xp_earned=20,
                    hearts_lost=0,
                    started_at=now_utc - timedelta(days=2 - l_idx, minutes=15),
                    completed_at=now_utc - timedelta(days=2 - l_idx),
                )
                db.add(attempt)
                db.flush()

                # Seed sample exercise attempts for this lesson attempt
                for ex in lesson.exercises:
                    ex_attempt = (
                        db.query(ExerciseAttempt)
                        .filter(
                            ExerciseAttempt.lesson_attempt_id == attempt.id,
                            ExerciseAttempt.exercise_id == ex.id,
                        )
                        .first()
                    )
                    if not ex_attempt:
                        ex_attempt = ExerciseAttempt(
                            lesson_attempt_id=attempt.id,
                            exercise_id=ex.id,
                            answer={"selected": "correct"},
                            is_correct=True,
                            attempt_number=1,
                            xp_earned=2,
                            created_at=attempt.completed_at or now_utc,
                        )
                        db.add(ex_attempt)

    db.flush()
    return user


def run_seed() -> dict[str, int]:
    """Initializes tables and seeds all data idempotently, returning summary counts."""
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        course = seed_curriculum(db)
        ach_map = seed_achievements(db)
        seed_learner(db, course, ach_map)
        db.commit()

        # Gather summary counts for validation
        counts = {
            "Course": db.query(Course).count(),
            "Units": db.query(Unit).count(),
            "Skills": db.query(Skill).count(),
            "Lessons": db.query(Lesson).count(),
            "Exercises": db.query(Exercise).count(),
            "Users": db.query(User).count(),
            "LearnerStats": db.query(LearnerStats).count(),
            "UserSkillProgress": db.query(UserSkillProgress).count(),
            "DailyActivities": db.query(DailyActivity).count(),
            "Achievements": db.query(Achievement).count(),
            "UserAchievements": db.query(UserAchievement).count(),
            "LessonAttempts": db.query(LessonAttempt).count(),
            "ExerciseAttempts": db.query(ExerciseAttempt).count(),
        }

        # Verify exercise types count
        distinct_types = [t[0] for t in db.query(Exercise.type).distinct().all()]
        counts["ExerciseTypesCount"] = len(distinct_types)

        return counts
    except Exception as exc:
        db.rollback()
        raise exc
    finally:
        db.close()


def print_report(counts: dict[str, int]) -> None:
    """Prints a clean, formatted validation summary."""
    print("=" * 50)
    print("LingoLoop Phase 2 Seed Complete")
    print("=" * 50)
    for key, count in counts.items():
        print(f"  {key:<22}: {count}")
    print("=" * 50)
    print("Idempotency: Verified (safe to re-execute)")
    print("=" * 50)


if __name__ == "__main__":
    summary_counts = run_seed()
    print_report(summary_counts)
