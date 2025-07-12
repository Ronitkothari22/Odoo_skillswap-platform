import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import swapService, { SwapRequest, SwapRequestStats } from '../services/swapService';

interface SwapRequestManagerProps {
  initialTab?: 'received' | 'sent' | 'stats';
}

function SwapRequestManager({ initialTab = 'received' }: SwapRequestManagerProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'stats'>(initialTab);
  const [receivedRequests, setReceivedRequests] = useState<SwapRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SwapRequest[]>([]);
  const [stats, setStats] = useState<SwapRequestStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseAction, setResponseAction] = useState<'accept' | 'reject'>('accept');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'received') {
        const response = await swapService.getReceivedSwapRequests();
        if (response.success && response.data) {
          setReceivedRequests(response.data.swaps);
        }
      } else if (activeTab === 'sent') {
        const response = await swapService.getSentSwapRequests();
        if (response.success && response.data) {
          setSentRequests(response.data.swaps);
        }
      } else if (activeTab === 'stats') {
        const response = await swapService.getSwapRequestStats();
        if (response.success && response.data) {
          setStats(response.data as SwapRequestStats);
        }
      }
    } catch (error) {
      console.error('Error loading swap requests:', error);
      setError('Failed to load swap requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReject = async (request: SwapRequest, action: 'accept' | 'reject') => {
    setSelectedRequest(request);
    setResponseAction(action);
    setShowResponseModal(true);
  };

  const confirmResponse = async () => {
    if (!selectedRequest) return;

    try {
      setLoading(true);
      setError(null);

      const response = responseAction === 'accept' 
        ? await swapService.acceptSwapRequest(selectedRequest.id, responseMessage)
        : await swapService.rejectSwapRequest(selectedRequest.id, responseMessage);

      if (response.success) {
        setShowResponseModal(false);
        setSelectedRequest(null);
        setResponseMessage('');
        await loadData(); // Reload data
        alert(`Swap request ${responseAction}ed successfully!`);
      } else {
        setError(`Failed to ${responseAction} swap request. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${responseAction}ing swap request:`, error);
      setError(`Failed to ${responseAction} swap request. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (requestId: string) => {
    if (!confirm('Are you sure you want to withdraw this swap request?')) return;

    try {
      setLoading(true);
      setError(null);

      const response = await swapService.deleteSwapRequest(requestId);
      if (response.success) {
        await loadData(); // Reload data
        alert('Swap request withdrawn successfully!');
      } else {
        setError('Failed to withdraw swap request. Please try again.');
      }
    } catch (error) {
      console.error('Error withdrawing swap request:', error);
      setError('Failed to withdraw swap request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRequestCard = (request: SwapRequest, isReceived: boolean) => (
    <Card key={request.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {isReceived 
                  ? request.requester.name.split(' ').map(n => n[0]).join('')
                  : request.responder.name.split(' ').map(n => n[0]).join('')
                }
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">
                {isReceived ? request.requester.name : request.responder.name}
              </h3>
              <p className="text-sm text-gray-600">
                Rating: {(isReceived ? request.requester.rating_avg : request.responder.rating_avg).toFixed(1)}/5
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(request.status)}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(request.created_at)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                {isReceived ? 'They offer:' : 'You offered:'}
              </p>
              <Badge className="bg-green-100 text-green-800 mt-1">
                {request.give_skill.name}
              </Badge>
            </div>
            <div className="mx-4 text-gray-400">⇄</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                {isReceived ? 'They want:' : 'You want:'}
              </p>
              <Badge className="bg-blue-100 text-blue-800 mt-1">
                {request.take_skill.name}
              </Badge>
            </div>
          </div>
          
          {request.message && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{request.message}</p>
            </div>
          )}
          
          {request.status === 'pending' && (
            <div className="flex justify-end space-x-2">
              {isReceived ? (
                <>
                  <Button
                    onClick={() => handleAcceptReject(request, 'reject')}
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleAcceptReject(request, 'accept')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Accept
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleWithdraw(request.id)}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  Withdraw
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats?.totalSent || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Received Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats?.totalReceived || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accepted Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats?.totalAccepted || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats?.totalPending || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cancelled Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats?.totalCancelled || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      {stats?.recentSwaps && stats.recentSwaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentSwaps.slice(0, 5).map((swap) => (
                <div key={swap.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(swap.status)}>
                      {swap.status}
                    </Badge>
                    <span className="text-sm">
                      {swap.give_skill.name} ⇄ {swap.take_skill.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatDate(swap.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Swap Request Manager</h1>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="text-gray-700 hover:bg-gray-100"
              >
                Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/profile')}
                variant="outline"
                className="text-gray-700 hover:bg-gray-100"
              >
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'received'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Received Requests
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sent Requests
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Statistics
              </button>
            </nav>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <div>
            {activeTab === 'received' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Received Requests</h2>
                  <p className="text-gray-600">Swap requests that others have sent to you.</p>
                </div>
                {receivedRequests.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-gray-500">You haven't received any swap requests yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div>
                    {receivedRequests.map((request) => renderRequestCard(request, true))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sent' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Sent Requests</h2>
                  <p className="text-gray-600">Swap requests that you have sent to others.</p>
                </div>
                {sentRequests.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-gray-500">You haven't sent any swap requests yet.</p>
                      <Button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Browse Users
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div>
                    {sentRequests.map((request) => renderRequestCard(request, false))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Statistics</h2>
                  <p className="text-gray-600">Your swap request activity overview.</p>
                </div>
                {renderStatsTab()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">
              {responseAction === 'accept' ? 'Accept' : 'Reject'} Swap Request
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to {responseAction} this swap request from {selectedRequest.requester.name}?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={`Add a message to explain your ${responseAction === 'accept' ? 'acceptance' : 'rejection'}...`}
                className="w-full"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedRequest(null);
                  setResponseMessage('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmResponse}
                className={responseAction === 'accept' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
                }
              >
                {responseAction === 'accept' ? 'Accept' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SwapRequestManager; 