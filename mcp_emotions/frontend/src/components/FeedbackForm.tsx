import { useState } from 'react';
import { submitFeedback } from '../api/client';

interface FeedbackFormProps {
  text: string;
  predicted_emotions: string[];
  onSuccess?: () => void;
}

const EMOTION_LIST = [
  'admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring', 'confusion', 'curiosity',
  'desire', 'disappointment', 'disapproval', 'disgust', 'embarrassment', 'excitement', 'fear', 'gratitude',
  'grief', 'joy', 'love', 'nervousness', 'optimism', 'pride', 'realization', 'relief', 'remorse', 'sadness',
  'surprise', 'neutral'
];

export default function FeedbackForm({ text, predicted_emotions, onSuccess }: FeedbackFormProps) {
  const [suggestedEmotions, setSuggestedEmotions] = useState<string[]>([]);
  const [suggestInput, setSuggestInput] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleAddSuggestion = () => {
    const val = suggestInput.trim().toLowerCase();
    if (val && !suggestedEmotions.includes(val) && EMOTION_LIST.includes(val)) {
      setSuggestedEmotions([...suggestedEmotions, val]);
    }
    setSuggestInput('');
  };

  const handleRemoveSuggestion = (emotion: string) => {
    setSuggestedEmotions(suggestedEmotions.filter(e => e !== emotion));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await submitFeedback({
        text,
        predicted_emotions,
        suggested_emotions: suggestedEmotions,
        comment,
      }, token || undefined);
      setSuccess('Thank you for your feedback!');
      setSuggestedEmotions([]);
      setComment('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mt-6 max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-2">Feedback on Emotion Detection</h2>
      <div className="mb-4">
        <div className="font-medium">Text:</div>
        <div className="bg-gray-50 rounded p-2 text-gray-700">{text}</div>
      </div>
      <div className="mb-4">
        <div className="font-medium mb-1">Predicted Emotions:</div>
        <div className="flex flex-wrap gap-2">
          {predicted_emotions.map(emotion => (
            <span key={emotion} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
              {emotion}
            </span>
          ))}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          These emotions were detected by the AI. Use the voting buttons (👍👎) to rate their accuracy.
        </div>
      </div>
      <div className="mb-4">
        <div className="font-medium mb-1">Suggest missing emotions:</div>
        <div className="flex items-center mb-2">
          <input
            type="text"
            className="border rounded px-2 py-1 mr-2 w-40"
            placeholder="e.g. pride"
            value={suggestInput}
            onChange={e => setSuggestInput(e.target.value)}
            list="emotion-list"
          />
          <button type="button" onClick={handleAddSuggestion} className="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600">Add</button>
          <datalist id="emotion-list">
            {EMOTION_LIST.map(e => <option key={e} value={e} />)}
          </datalist>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedEmotions.map(e => (
            <span key={e} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full flex items-center">
              {e}
              <button type="button" className="ml-1 text-xs text-red-500" onClick={() => handleRemoveSuggestion(e)}>✕</button>
            </span>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="font-medium mb-1 block">Comment (optional):</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          maxLength={500}
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder="Any additional thoughts?"
        />
        <div className="text-xs text-gray-400 text-right">{comment.length}/500</div>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
} 