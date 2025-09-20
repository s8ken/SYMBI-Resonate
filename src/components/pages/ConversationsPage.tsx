import { useState } from "react";
import { Upload, FileText, Trash2, Plus, Download, Search, Filter, Loader2, AlertCircle } from "lucide-react";

const mockConversations = [
  {
    id: "1",
    title: "Collaborative Strategy Discussion - AI Integration",
    model: "OpenAI GPT-4",
    created_at: "2025-01-07T10:00:00Z",
    messages_count: 12,
    status: "analyzed" as const,
    sentiment: "positive" as const
  },
  {
    id: "2",
    title: "Synergy Framework Documentation",
    model: "Claude 3",
    created_at: "2025-01-06T15:30:00Z",
    messages_count: 8,
    status: "processing" as const,
    sentiment: "neutral" as const
  },
  {
    id: "3",
    title: "Partnership Potential Analysis",
    model: "Gemini Pro",
    created_at: "2025-01-05T09:15:00Z",
    messages_count: 15,
    status: "analyzed" as const,
    sentiment: "mixed" as const
  },
  {
    id: "4",
    title: "Integration Setup Collaboration",
    model: "Meta AI",
    created_at: "2025-01-04T14:45:00Z",
    messages_count: 6,
    status: "failed" as const,
    sentiment: "negative" as const
  },
];

type ConversationStatus = "processing" | "analyzed" | "failed";
type ConversationSentiment = "positive" | "negative" | "neutral" | "mixed" | "pending";

interface Conversation {
  id: string;
  title: string;
  model: string;
  created_at: string;
  messages_count: number;
  status: ConversationStatus;
  sentiment: ConversationSentiment;
}

export function ConversationsPage() {
  const [uploadMethod, setUploadMethod] = useState<"manual" | "file" | "api">("manual");
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [loading, setLoading] = useState(false);
  const [newConversation, setNewConversation] = useState({
    title: "",
    model: "",
    content: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddConversation = async () => {
    if (!newConversation.title || !newConversation.content) {
      alert("Please fill in title and content");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: newConversation.title,
        model: newConversation.model || "Unknown",
        created_at: new Date().toISOString(),
        messages_count: newConversation.content.split('\n').filter(line => line.trim()).length,
        status: "processing",
        sentiment: "pending"
      };
      
      setConversations(prev => [newConv, ...prev]);
      setNewConversation({ title: "", model: "", content: "" });
      setIsSubmitting(false);
      
      // Simulate processing completion
      setTimeout(() => {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === newConv.id 
              ? { ...conv, status: "analyzed" as const, sentiment: "positive" as const }
              : conv
          )
        );
      }, 3000);
    }, 1000);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setNewConversation(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ""),
        content: content
      }));
      setUploadMethod("manual");
      alert("File loaded successfully");
    };
    reader.readAsText(file);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "analyzed":
        return "bg-brutalist-black text-brutalist-white";
      case "processing":
        return "bg-brutalist-gray-light text-brutalist-black border-2 border-brutalist-black";
      case "failed":
        return "bg-brutalist-white text-brutalist-black border-2 border-brutalist-black";
      default:
        return "bg-brutalist-gray-light text-brutalist-black";
    }
  };

  const getSentimentStyle = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-brutalist-black text-brutalist-white";
      case "negative":
        return "bg-brutalist-white text-brutalist-black border-2 border-brutalist-black";
      case "mixed":
        return "bg-brutalist-gray-light text-brutalist-black border-2 border-brutalist-black";
      default:
        return "bg-brutalist-gray-light text-brutalist-black border-2 border-brutalist-black";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || conv.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      {/* Header */}
      <header className="bg-brutalist-white border-b-4 border-brutalist-black px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-brutalist-black mb-2">CONVERSATIONS</h1>
            <p className="text-brutalist-black font-bold uppercase">UPLOAD AND MANAGE AI COLLABORATION DATA</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="brutalist-tag">
              {conversations.length} TOTAL
            </div>
            <button className="brutalist-button-primary gap-2 flex items-center">
              <Download className="w-5 h-5" />
              EXPORT ALL
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-brutalist-white">
        {/* Upload Section */}
        <div className="mb-12">
          <div className="brutalist-card mb-8">
            <h2 className="text-2xl font-black text-brutalist-black mb-6 uppercase">ADD NEW COLLABORATIONS</h2>
            
            {/* Upload Method Selector */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setUploadMethod("manual")}
                className={`brutalist-button-secondary ${uploadMethod === "manual" ? "bg-brutalist-black text-brutalist-white" : ""}`}
              >
                MANUAL ENTRY
              </button>
              <button
                onClick={() => setUploadMethod("file")}
                className={`brutalist-button-secondary ${uploadMethod === "file" ? "bg-brutalist-black text-brutalist-white" : ""}`}
              >
                FILE UPLOAD
              </button>
              <button
                onClick={() => setUploadMethod("api")}
                className={`brutalist-button-secondary ${uploadMethod === "api" ? "bg-brutalist-black text-brutalist-white" : ""}`}
              >
                API INTEGRATION
              </button>
            </div>

            {/* Manual Entry Form */}
            {uploadMethod === "manual" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-brutalist-black mb-3 uppercase">COLLABORATION TITLE</label>
                    <input
                      type="text"
                      value={newConversation.title}
                      onChange={(e) => setNewConversation({...newConversation, title: e.target.value})}
                      className="brutalist-input w-full"
                      placeholder="ENTER COLLABORATION TITLE"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-brutalist-black mb-3 uppercase">AI MODEL</label>
                    <input
                      type="text"
                      value={newConversation.model}
                      onChange={(e) => setNewConversation({...newConversation, model: e.target.value})}
                      className="brutalist-input w-full"
                      placeholder="E.G. OPENAI GPT-4, CLAUDE 3, ETC."
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-brutalist-black mb-3 uppercase">COLLABORATION CONTENT</label>
                  <textarea
                    value={newConversation.content}
                    onChange={(e) => setNewConversation({...newConversation, content: e.target.value})}
                    className="brutalist-input w-full h-40 resize-none"
                    placeholder="PASTE YOUR COLLABORATION DATA HERE..."
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  onClick={handleAddConversation}
                  disabled={isSubmitting}
                  className="brutalist-button-primary gap-2 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      ADDING...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      ADD COLLABORATION
                    </>
                  )}
                </button>
              </div>
            )}

            {/* File Upload */}
            {uploadMethod === "file" && (
              <div className="text-center py-12 border-4 border-dashed border-brutalist-black bg-brutalist-gray-light">
                <Upload className="w-16 h-16 text-brutalist-black mx-auto mb-6" />
                <h3 className="text-xl font-black text-brutalist-black mb-4 uppercase">DRAG & DROP FILES HERE</h3>
                <p className="text-brutalist-black font-bold mb-6 uppercase">OR CLICK TO SELECT FILES</p>
                <input
                  type="file"
                  accept=".txt,.csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="brutalist-button-primary cursor-pointer">
                  SELECT FILES
                </label>
                <p className="text-sm text-brutalist-black font-bold mt-4 uppercase">SUPPORTED: TXT, CSV, JSON</p>
              </div>
            )}

            {/* API Integration */}
            {uploadMethod === "api" && (
              <div className="space-y-6">
                <div className="bg-brutalist-gray-light border-4 border-brutalist-black p-6">
                  <h3 className="text-lg font-black text-brutalist-black mb-4 uppercase">API ENDPOINT</h3>
                  <code className="block bg-brutalist-white border-2 border-brutalist-black p-4 font-mono text-sm font-bold">
                    POST /api/collaborations
                  </code>
                </div>
                <div className="bg-brutalist-gray-light border-4 border-brutalist-black p-6">
                  <h3 className="text-lg font-black text-brutalist-black mb-4 uppercase">EXAMPLE PAYLOAD</h3>
                  <pre className="bg-brutalist-white border-2 border-brutalist-black p-4 font-mono text-xs font-bold overflow-x-auto">
{`{
  "title": "AI Partnership Strategy",
  "model": "OpenAI GPT-4",
  "content": "User: Let's discuss synergy...\\nAssistant: I'd be happy to collaborate..."
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conversations List */}
        <div className="brutalist-card">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-black text-brutalist-black uppercase">COLLABORATION HISTORY</h2>
            
            {/* Search and Filter */}
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="brutalist-input w-full pl-12"
                  placeholder="SEARCH COLLABORATIONS"
                />
                <Search className="w-5 h-5 text-brutalist-black absolute left-4 top-1/2 transform -translate-y-1/2" />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="brutalist-input font-bold uppercase"
              >
                <option value="all">ALL STATUS</option>
                <option value="analyzed">ANALYZED</option>
                <option value="processing">PROCESSING</option>
                <option value="failed">FAILED</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-brutalist-black mx-auto mb-4 animate-spin" />
              <p className="text-brutalist-black font-bold uppercase">LOADING COLLABORATIONS...</p>
            </div>
          )}

          {/* Conversations Table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-4 border-brutalist-black">
                    <th className="text-left font-black text-brutalist-black pb-4 uppercase">TITLE</th>
                    <th className="text-left font-black text-brutalist-black pb-4 uppercase">MODEL</th>
                    <th className="text-center font-black text-brutalist-black pb-4 uppercase">DATE</th>
                    <th className="text-center font-black text-brutalist-black pb-4 uppercase">EXCHANGES</th>
                    <th className="text-center font-black text-brutalist-black pb-4 uppercase">STATUS</th>
                    <th className="text-center font-black text-brutalist-black pb-4 uppercase">SYNERGY</th>
                    <th className="text-center font-black text-brutalist-black pb-4 uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConversations.map((conversation) => (
                    <tr key={conversation.id} className="border-b-2 border-brutalist-black hover:bg-brutalist-gray-light transition-colors">
                      <td className="py-6 max-w-xs">
                        <p className="font-bold text-brutalist-black leading-relaxed uppercase truncate">
                          {conversation.title}
                        </p>
                      </td>
                      <td className="py-6 font-bold text-brutalist-black uppercase">{conversation.model}</td>
                      <td className="py-6 text-center font-bold text-brutalist-black uppercase">
                        {formatDate(conversation.created_at)}
                      </td>
                      <td className="py-6 text-center font-bold text-brutalist-black">{conversation.messages_count}</td>
                      <td className="py-6 text-center">
                        <span className={`brutalist-tag ${getStatusStyle(conversation.status)} flex items-center justify-center gap-2`}>
                          {conversation.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                          {conversation.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                          {conversation.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-6 text-center">
                        <span className={`brutalist-tag ${getSentimentStyle(conversation.sentiment)}`}>
                          {conversation.sentiment.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            className="p-2 border-2 border-brutalist-black bg-brutalist-white hover:bg-brutalist-black hover:text-brutalist-white transition-colors"
                            title="View Details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteConversation(conversation.id)}
                            className="p-2 border-2 border-brutalist-black bg-brutalist-white hover:bg-brutalist-black hover:text-brutalist-white transition-colors"
                            title="Delete Collaboration"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredConversations.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-brutalist-black mx-auto mb-4" />
              <h3 className="text-xl font-black text-brutalist-black mb-2 uppercase">NO COLLABORATIONS FOUND</h3>
              <p className="text-brutalist-black font-bold uppercase">
                {searchTerm || selectedFilter !== 'all' 
                  ? "Try adjusting your search or filter" 
                  : "Upload your first collaboration to get started"
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}