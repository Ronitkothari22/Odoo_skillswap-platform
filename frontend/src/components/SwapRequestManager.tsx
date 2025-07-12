import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    loadData();
    // Trigger animations after component mounts
    setTimeout(() => setAnimate(true), 100);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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

  const renderRequestCard = (request: SwapRequest, isReceived: boolean, index: number = 0) => (
    <Card 
      key={request.id} 
      className={`group bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden mb-6 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      style={{ transitionDelay: `${100 + index * 100}ms` }}
    >
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 ring-4 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300">
              <AvatarImage 
                src={isReceived ? request.requester.avatar_url : request.responder.avatar_url} 
                alt={isReceived ? request.requester.name : request.responder.name} 
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-lg font-semibold">
                {isReceived 
                  ? request.requester.name.split(' ').map(n => n[0]).join('')
                  : request.responder.name.split(' ').map(n => n[0]).join('')
                }
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                {isReceived ? request.requester.name : request.responder.name}
              </h3>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500 mr-2">Rating:</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {(isReceived ? request.requester.rating_avg : request.responder.rating_avg).toFixed(1)}
                  </span>
                  <span className="text-yellow-400 ml-1">⭐</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge className={`${getStatusColor(request.status)} flex items-center gap-1 transition-all duration-200 hover:scale-105`}>
              {getStatusIcon(request.status)}
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              {formatDate(request.created_at)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Skills Exchange */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {isReceived ? 'They offer:' : 'You offered:'}
                </p>
                <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1 transition-all duration-200 hover:scale-105">
                  {request.give_skill.name}
                </Badge>
              </div>
              <div className="mx-6 flex items-center justify-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">⇄</span>
                </div>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {isReceived ? 'They want:' : 'You want:'}
                </p>
                <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1 transition-all duration-200 hover:scale-105">
                  {request.take_skill.name}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Message */}
          {request.message && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Message:</h4>
              <p className="text-sm text-gray-700 italic">"{request.message}"</p>
            </div>
          )}
          
          {/* Action Buttons */}
          {request.status === 'pending' && (
            <div className="flex justify-end space-x-3 pt-2">
              {isReceived ? (
                <>
                  <Button
                    onClick={() => handleAcceptReject(request, 'reject')}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 transition-all duration-200 hover:scale-105"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleAcceptReject(request, 'accept')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-200 hover:scale-105 shadow-md"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleWithdraw(request.id)}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 transition-all duration-200 hover:scale-105"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              )}
            </div>
          )}

          {/* Status Message for completed requests */}
          {request.status !== 'pending' && (
            <div className={`rounded-xl p-3 ${
              request.status === 'accepted' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-medium ${
                request.status === 'accepted' ? 'text-green-700' : 'text-red-700'
              }`}>
                {request.status === 'accepted' 
                  ? isReceived 
                    ? 'You accepted this swap request' 
                    : 'Your swap request was accepted'
                  : isReceived 
                    ? 'You rejected this swap request' 
                    : 'Your swap request was rejected'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderStatsTab = () => (
    <div className={`space-y-8 transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats?.totalSent || 0}</div>
                <div className="text-sm text-gray-600">Sent Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats?.totalReceived || 0}</div>
                <div className="text-sm text-gray-600">Received Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats?.totalAccepted || 0}</div>
                <div className="text-sm text-gray-600">Accepted Swaps</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats?.totalPending || 0}</div>
                <div className="text-sm text-gray-600">Pending Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats?.totalCancelled || 0}</div>
                <div className="text-sm text-gray-600">Cancelled Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      {stats?.recentSwaps && stats.recentSwaps.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentSwaps.slice(0, 5).map((swap, index) => (
                <div 
                  key={swap.id} 
                  className={`flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 transform ${animate ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <Badge className={`${getStatusColor(swap.status)} flex items-center gap-1`}>
                      {getStatusIcon(swap.status)}
                      {swap.status}
                    </Badge>
                    <span className="text-sm font-medium text-gray-900">
                      {swap.give_skill.name}
                    </span>
                    <span className="text-gray-400">⇄</span>
                    <span className="text-sm font-medium text-gray-900">
                      {swap.take_skill.name}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Swap Request Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-2 border-blue-200 hover:border-blue-300 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 font-semibold text-sm transition-all duration-200 hover:scale-105"
              >
                Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/profile')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-4 py-2 font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg mb-8">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'received' | 'sent' | 'stats')}>
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 border-b border-gray-200">
              <TabsTrigger value="received" className="text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-white">
                Received Requests
              </TabsTrigger>
              <TabsTrigger value="sent" className="text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-white">
                Sent Requests
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-white">
                Statistics
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mb-4">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-600">Loading swap requests...</p>
                </div>
              )}

              {/* Tab Content */}
              {!loading && (
                <>
                  <TabsContent value="received" className="space-y-4">
                    <div className={`mb-8 transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Received Requests</h2>
                      <p className="text-gray-600">Swap requests that others have sent to you.</p>
                    </div>
                    {receivedRequests.length === 0 ? (
                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardContent className="text-center py-16">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
                          <p className="text-gray-500 mb-4">You haven't received any swap requests yet.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div>
                        {receivedRequests.map((request, index) => renderRequestCard(request, true, index))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="sent" className="space-y-4">
                    <div className={`mb-8 transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Sent Requests</h2>
                      <p className="text-gray-600">Swap requests that you have sent to others.</p>
                    </div>
                    {sentRequests.length === 0 ? (
                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardContent className="text-center py-16">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests sent</h3>
                          <p className="text-gray-500 mb-4">You haven't sent any swap requests yet.</p>
                          <Button
                            onClick={() => navigate('/dashboard')}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-3 font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                          >
                            Browse Users
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div>
                        {sentRequests.map((request, index) => renderRequestCard(request, false, index))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="stats" className="space-y-4">
                    <div className={`mb-8 transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Statistics</h2>
                      <p className="text-gray-600">Your swap request activity overview.</p>
                    </div>
                    {renderStatsTab()}
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl transform transition-all duration-300 scale-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {responseAction === 'accept' ? 'Accept' : 'Reject'} Swap Request
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {responseAction} this swap request from {selectedRequest.requester.name}?
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={`Add a message to explain your ${responseAction === 'accept' ? 'acceptance' : 'rejection'}...`}
                className="w-full bg-white/80 border border-gray-200 rounded-xl"
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
                className="border-2 border-gray-200 hover:border-gray-300 rounded-xl px-6 py-2 font-semibold transition-all duration-200 hover:scale-105"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmResponse}
                className={`rounded-xl px-6 py-2 font-semibold transition-all duration-200 hover:scale-105 shadow-lg ${
                  responseAction === 'accept' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white' 
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                }`}
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