import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSupabaseCourses } from '../hooks/useSupabaseCourses';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Save,
  Eye,
  GripVertical,
  FileText,
  HelpCircle,
  Image,
  AlertCircle
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Module {
  id: string;
  title: string;
  content: string;
  order: number;
  type: 'text';
  estimatedTime: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  order: number;
}

const CreateCourse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createCourse } = useSupabaseCourses();
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    estimatedTime: 60,
    isPublished: false
  });
  
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addModule = () => {
    const newModule: Module = {
      id: uuidv4(),
      title: '',
      content: '',
      order: modules.length,
      type: 'text',
      estimatedTime: 10
    };
    setModules([...modules, newModule]);
  };

  const updateModule = (id: string, field: keyof Module, value: any) => {
    setModules(modules.map(module => 
      module.id === id ? { ...module, [field]: value } : module
    ));
  };

  const removeModule = (id: string) => {
    setModules(modules.filter(module => module.id !== id));
  };

  const addQuiz = () => {
    const newQuiz: Quiz = {
      id: uuidv4(),
      title: '',
      questions: [],
      passingScore: 70,
      order: quizzes.length
    };
    setQuizzes([...quizzes, newQuiz]);
  };

  const updateQuiz = (id: string, field: keyof Quiz, value: any) => {
    setQuizzes(quizzes.map(quiz => 
      quiz.id === id ? { ...quiz, [field]: value } : quiz
    ));
  };

  const removeQuiz = (id: string) => {
    setQuizzes(quizzes.filter(quiz => quiz.id !== id));
  };

  const addQuizQuestion = (quizId: string) => {
    const newQuestion: QuizQuestion = {
      id: uuidv4(),
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10
    };
    
    setQuizzes(quizzes.map(quiz => 
      quiz.id === quizId 
        ? { ...quiz, questions: [...quiz.questions, newQuestion] }
        : quiz
    ));
  };

  const updateQuizQuestion = (quizId: string, questionId: string, field: keyof QuizQuestion, value: any) => {
    setQuizzes(quizzes.map(quiz => 
      quiz.id === quizId 
        ? {
            ...quiz,
            questions: quiz.questions.map(question =>
              question.id === questionId ? { ...question, [field]: value } : question
            )
          }
        : quiz
    ));
  };

  const removeQuizQuestion = (quizId: string, questionId: string) => {
    setQuizzes(quizzes.map(quiz => 
      quiz.id === quizId 
        ? { ...quiz, questions: quiz.questions.filter(q => q.id !== questionId) }
        : quiz
    ));
  };

  const addQuestionOption = (quizId: string, questionId: string) => {
    setQuizzes(quizzes.map(quiz => 
      quiz.id === quizId 
        ? {
            ...quiz,
            questions: quiz.questions.map(question =>
              question.id === questionId && question.options
                ? { ...question, options: [...question.options, ''] }
                : question
            )
          }
        : quiz
    ));
  };

  const updateQuestionOption = (quizId: string, questionId: string, optionIndex: number, value: string) => {
    setQuizzes(quizzes.map(quiz => 
      quiz.id === quizId 
        ? {
            ...quiz,
            questions: quiz.questions.map(question =>
              question.id === questionId && question.options
                ? { 
                    ...question, 
                    options: question.options.map((opt, idx) => idx === optionIndex ? value : opt)
                  }
                : question
            )
          }
        : quiz
    ));
  };

  const removeQuestionOption = (quizId: string, questionId: string, optionIndex: number) => {
    setQuizzes(quizzes.map(quiz => 
      quiz.id === quizId 
        ? {
            ...quiz,
            questions: quiz.questions.map(question =>
              question.id === questionId && question.options
                ? { 
                    ...question, 
                    options: question.options.filter((_, idx) => idx !== optionIndex)
                  }
                : question
            )
          }
        : quiz
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate content size
    const totalContentSize = modules.reduce((total, module) => total + module.content.length, 0);
    if (totalContentSize > 1000000) { // 1MB limit
      alert('Course content is too large. Please reduce the amount of content or split into multiple courses.');
      return;
    }

    // Validate required fields
    if (!courseData.title.trim() || !courseData.description.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    // Validate modules have content
    const emptyModules = modules.filter(m => !m.title.trim() || !m.content.trim());
    if (emptyModules.length > 0) {
      alert('Please ensure all modules have both a title and content.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send Discord webhook for staff action
      const staffWebhookUrl = 'https://discord.com/api/webhooks/1402319981605290114/-KCOA_9a-PMM2qqZWqT4IF77WI-2xba27PwqFz1e4xm6-pzxc3eynXemllHslX2AZ_og';
      
      const webhookData = {
        embeds: [{
          title: '📚 New Course Created',
          description: `${user.username} has created a new course`,
          color: 0x1c2341,
          fields: [
            {
              name: 'Course Title',
              value: courseData.title,
              inline: false
            },
            {
              name: 'Description',
              value: courseData.description.length > 100 
                ? courseData.description.substring(0, 100) + '...' 
                : courseData.description,
              inline: false
            },
            {
              name: 'Modules',
              value: modules.length.toString(),
              inline: true
            },
            {
              name: 'Quizzes',
              value: quizzes.length.toString(),
              inline: true
            },
            {
              name: 'Estimated Time',
              value: `${courseData.estimatedTime} minutes`,
              inline: true
            },
            {
              name: 'Status',
              value: courseData.isPublished ? 'Published' : 'Draft',
              inline: true
            },
            {
              name: 'Created By',
              value: user.username,
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Oakridge Education Portal'
          }
        }]
      };

      // Send webhook (don't block on failure)
      try {
        await fetch(staffWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        });
      } catch (webhookError) {
        console.warn('Failed to send Discord webhook:', webhookError);
      }

      // Create the course
      const createdCourse = await createCourse({
        title: courseData.title,
        description: courseData.description,
        estimated_time: courseData.estimatedTime,
        is_published: courseData.isPublished,
        modules: modules.map((module, index) => ({ 
          ...module, 
          order: index,
          content: module.content.trim() // Trim whitespace
        })),
        quizzes: quizzes.map((quiz, index) => ({ 
          ...quiz, 
          order: index,
          questions: quiz.questions.map(q => ({
            ...q,
            question: q.question.trim(),
            correctAnswer: q.correctAnswer.trim()
          }))
        }))
      });
      
      // Navigate to the new course
      navigate(`/courses/${createdCourse.id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('There was an error creating the course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async (e: React.MouseEvent) => {
    e.preventDefault();
    setCourseData(prev => ({ ...prev, isPublished: false }));
    // Wait for state to update, then submit
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }, 0);
  };

  const handlePublish = async (e: React.MouseEvent) => {
    e.preventDefault();
    setCourseData(prev => ({ ...prev, isPublished: true }));
    // Wait for state to update, then submit
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }, 0);
  };

  const insertImageMarkdown = (moduleId: string) => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      const module = modules.find(m => m.id === moduleId);
      if (module) {
        const imageMarkdown = `\n\n![Image](${imageUrl})\n\n`;
        updateModule(moduleId, 'content', module.content + imageMarkdown);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-[#1c2341] p-2 rounded-full mr-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
                <p className="text-gray-600">Build a comprehensive learning experience with text content and quizzes</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Course Basic Info */}
            <div className="space-y-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900">Course Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={courseData.estimatedTime}
                    onChange={(e) => setCourseData({ ...courseData, estimatedTime: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description *
                </label>
                <textarea
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Modules Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Course Modules</h2>
                  <p className="text-sm text-gray-600">Add text content with markdown support and images</p>
                </div>
                <button
                  type="button"
                  onClick={addModule}
                  className="inline-flex items-center px-4 py-2 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </button>
              </div>

              <div className="space-y-6">
                {modules.map((module, index) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Module {index + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeModule(module.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Module Title *
                        </label>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time (minutes)
                        </label>
                        <input
                          type="number"
                          value={module.estimatedTime}
                          onChange={(e) => updateModule(module.id, 'estimatedTime', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                          min="1"
                        />
                      </div>
                    </div>

                    {/* Content Type Description */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm text-blue-800">
                          Text content with full markdown support including headers, lists, links, and images
                        </span>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Module Content (Markdown supported) *
                        </label>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => insertImageMarkdown(module.id)}
                            className="inline-flex items-center text-sm text-[#1c2341] hover:text-[#2a3454] font-medium"
                          >
                            <Image className="h-4 w-4 mr-1" />
                            Add Image
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentContent = module.content;
                              const template = `\n\n## New Section\n\nAdd your content here...\n\n`;
                              updateModule(module.id, 'content', currentContent + template);
                            }}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Section
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={module.content}
                        onChange={(e) => updateModule(module.id, 'content', e.target.value)}
                        rows={20}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent font-mono text-sm resize-y min-h-[300px] max-h-[600px]"
                        placeholder="Enter module content using Markdown formatting...

Examples:
# Heading 1
## Heading 2
**Bold text**
*Italic text*
- Bullet point
 Alternative bullets
[Link text](https://example.com)
![Image description](https://example.com/image.jpg)

```code
Code blocks
```"
                        style={{
                          lineHeight: '1.5',
                          tabSize: 2,
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                        }}
                        required
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>Supports full Markdown: headers, emphasis, lists, tables, code blocks, blockquotes, links, images, and horizontal rules</span>
                          <span className="text-gray-400">
                            {module.content.length.toLocaleString()} characters
                          </span>
                        </div>
                        {module.content.length > 500000 && (
                          <div className="mt-1 text-yellow-600 text-xs">
                            ⚠️ Large content detected. Consider splitting into multiple modules for better performance.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {modules.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No modules added yet</h3>
                    <p className="text-gray-600 mb-4">Create engaging text content with markdown formatting</p>
                    <button
                      type="button"
                      onClick={addModule}
                      className="inline-flex items-center px-6 py-3 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Module
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quizzes Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Course Quizzes</h2>
                  <p className="text-sm text-gray-600">Add quizzes to test student knowledge</p>
                </div>
                <button
                  type="button"
                  onClick={addQuiz}
                  className="inline-flex items-center px-4 py-2 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quiz
                </button>
              </div>

              <div className="space-y-6">
                {quizzes.map((quiz, quizIndex) => (
                  <div key={quiz.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <HelpCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Quiz {quizIndex + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuiz(quiz.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quiz Title *
                        </label>
                        <input
                          type="text"
                          value={quiz.title}
                          onChange={(e) => updateQuiz(quiz.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Passing Score (%)
                        </label>
                        <input
                          type="number"
                          value={quiz.passingScore}
                          onChange={(e) => updateQuiz(quiz.id, 'passingScore', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                          min="1"
                          max="100"
                        />
                      </div>
                    </div>

                    {/* Quiz Questions */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-700">Questions</h4>
                        <button
                          type="button"
                          onClick={() => addQuizQuestion(quiz.id)}
                          className="text-sm text-[#1c2341] hover:text-[#2a3454] font-medium flex items-center"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Question
                        </button>
                      </div>

                      <div className="space-y-4">
                        {quiz.questions.map((question, questionIndex) => (
                          <div key={question.id} className="border border-gray-300 rounded-lg p-4 bg-white">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-700">
                                Question {questionIndex + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeQuizQuestion(quiz.id, question.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Question Text *
                                </label>
                                <input
                                  type="text"
                                  value={question.question}
                                  onChange={(e) => updateQuizQuestion(quiz.id, question.id, 'question', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Question Type
                                </label>
                                <select
                                  value={question.type}
                                  onChange={(e) => {
                                    const newType = e.target.value as 'multiple-choice' | 'short-answer';
                                    updateQuizQuestion(quiz.id, question.id, 'type', newType);
                                    if (newType === 'multiple-choice' && !question.options) {
                                      updateQuizQuestion(quiz.id, question.id, 'options', ['', '', '', '']);
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                                >
                                  <option value="multiple-choice">Multiple Choice</option>
                                  <option value="short-answer">Short Answer</option>
                                </select>
                              </div>
                            </div>

                            {/* Multiple Choice Options */}
                            {question.type === 'multiple-choice' && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Answer Options
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => addQuestionOption(quiz.id, question.id)}
                                    className="text-sm text-[#1c2341] hover:text-[#2a3454] font-medium"
                                  >
                                    + Add Option
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {(question.options || []).map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name={`correct-${question.id}`}
                                        checked={question.correctAnswer === option}
                                        onChange={() => updateQuizQuestion(quiz.id, question.id, 'correctAnswer', option)}
                                        className="h-4 w-4 text-[#1c2341] focus:ring-[#1c2341] border-gray-300"
                                      />
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateQuestionOption(quiz.id, question.id, optionIndex, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                                        placeholder={`Option ${optionIndex + 1}`}
                                      />
                                      {(question.options?.length || 0) > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => removeQuestionOption(quiz.id, question.id, optionIndex)}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                  Select the radio button next to the correct answer
                                </p>
                              </div>
                            )}

                            {/* Short Answer */}
                            {question.type === 'short-answer' && (
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Correct Answer *
                                </label>
                                <input
                                  type="text"
                                  value={question.correctAnswer}
                                  onChange={(e) => updateQuizQuestion(quiz.id, question.id, 'correctAnswer', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                                  placeholder="Enter the correct answer"
                                  required
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Points
                              </label>
                              <input
                                type="number"
                                value={question.points}
                                onChange={(e) => updateQuizQuestion(quiz.id, question.id, 'points', parseInt(e.target.value))}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                                min="1"
                              />
                            </div>
                          </div>
                        ))}

                        {quiz.questions.length === 0 && (
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <HelpCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-gray-600 text-sm">No questions added yet</p>
                            <button
                              type="button"
                              onClick={() => addQuizQuestion(quiz.id)}
                              className="mt-2 text-sm text-[#1c2341] hover:text-[#2a3454] font-medium"
                            >
                              Add First Question
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {quizzes.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes added yet</h3>
                    <p className="text-gray-600 mb-4">Add quizzes to test student knowledge</p>
                    <button
                      type="button"
                      onClick={addQuiz}
                      className="inline-flex items-center px-6 py-3 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting || !courseData.title || !courseData.description}
                  className="inline-flex items-center px-6 py-2 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Publish Course
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;