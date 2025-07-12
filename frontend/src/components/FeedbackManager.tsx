import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  StarIcon,
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Users, 
  Award,
  Filter,
  RotateCcw,
} from "lucide-react";
import { feedbackService, FeedbackWithDetails, FeedbackStats, CreateFeedbackDto, FeedbackFilters } from '@/services/feedbackService';
import { swapService } from '@/services/swapService';

function FeedbackManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats state
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  
  // Received feedback state
  const [receivedFeedback, setReceivedFeedback] = useState<FeedbackWithDetails[]>([]);
  const [receivedPage, setReceivedPage] = useState(1);
  const [receivedHasMore, setReceivedHasMore] = useState(false);
  const [receivedLoading, setReceivedLoading] = useState(false);
  
  // Available swaps for feedback state
  const [availableSwaps, setAvailableSwaps] = useState<any[]>([]);
  
  // Create feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<any>(null);
  const [feedbackStars, setFeedbackStars] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<FeedbackFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load feedback stats, received feedback, and available swaps in parallel
      const [statsResult, receivedResult, swapsResult] = await Promise.all([
        feedbackService.getFeedbackStats().catch(() => ({ success: false, data: null })),
        feedbackService.getMyFeedback({}, 1, 10).catch(() => ({ success: false, data: null })),
        swapService.getSwapRequests({ status: 'accepted', page: 1, limit: 50 }).catch(() => ({ success: false, data: null }))
      ]);

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      if (receivedResult.success && receivedResult.data) {
        setReceivedFeedback(receivedResult.data.feedback);
        setReceivedHasMore(receivedResult.data.hasMore);
      }

      if (swapsResult.success && swapsResult.data) {
        // Filter swaps that don't have feedback yet
        const swapsWithoutFeedback = swapsResult.data.swaps.filter((swap: any) => {
          // Check if current user can give feedback (they haven't given feedback for this swap yet)
          // This would need additional API call to check existing feedback, for now assume all accepted swaps need feedback
          return swap.status === 'accepted';
        });
        setAvailableSwaps(swapsWithoutFeedback);
      }
    } catch (error) {
      console.error('Error loading feedback data:', error);
      setError('Failed to load feedback data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreReceivedFeedback = async () => {
    if (receivedLoading || !receivedHasMore) return;

    try {
      setReceivedLoading(true);
      const result = await feedbackService.getMyFeedback(filters, receivedPage + 1, 10);
      
      if (result.success) {
        setReceivedFeedback(prev => [...prev, ...result.data.feedback]);
        setReceivedPage(prev => prev + 1);
        setReceivedHasMore(result.data.hasMore);
      }
    } catch (error) {
      console.error('Error loading more feedback:', error);
    } finally {
      setReceivedLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setReceivedLoading(true);
      const result = await feedbackService.getMyFeedback(filters, 1, 10);
      
      if (result.success) {
        setReceivedFeedback(result.data.feedback);
        setReceivedPage(1);
        setReceivedHasMore(result.data.hasMore);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setReceivedLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setReceivedFeedback([]);
    setReceivedPage(1);
    loadData();
  };

  const handleCreateFeedback = (swap: any) => {
    setSelectedSwap(swap);
    setFeedbackStars(5);
    setFeedbackComment('');
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
    if (!selectedSwap) return;

    try {
      setSubmittingFeedback(true);
      setError(null);

      const feedbackData: CreateFeedbackDto = {
        swap_id: selectedSwap.id,
        stars: feedbackStars,
        comment: feedbackComment.trim() || undefined
      };

      const result = await feedbackService.createFeedback(feedbackData);

      if (result.success) {
        setShowFeedbackModal(false);
        setSelectedSwap(null);
        // Refresh data
        loadData();
        // Show success message
        alert('Feedback submitted successfully!');
      } else {
        setError('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const renderStars = (rating: number, className: string = "h-5 w-5") => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${className} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderClickableStars = (rating: number, onStarClick: (stars: number) => void, className: string = "h-6 w-6") => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${className} cursor-pointer transition-colors ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200"
            }`}
            onClick={() => onStarClick(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <p className="text-lg text-gray-600">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Feedback Manager
            </h1>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="text-gray-700 hover:bg-gray-100"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="received">Received Feedback</TabsTrigger>
            <TabsTrigger value="give">Give Feedback</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Feedback</CardTitle>
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.total_feedback}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
                    <Award className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats?.average_rating?.toFixed(1) || '0.0'}</div>
                    <div className="mt-1">{renderStars(Math.round(stats?.average_rating || 0), "h-4 w-4")}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">5-Star Reviews</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats?.five_star_count || 0}</div>
                    <p className="text-xs text-gray-600 mt-1">
                      {stats?.total_feedback > 0 ? Math.round(((stats?.five_star_count || 0) / (stats?.total_feedback || 1)) * 100) : 0}% of total
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Recent Feedback</CardTitle>
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats?.recent_feedback?.length || 0}</div>
                    <p className="text-xs text-gray-600 mt-1">Last 30 days</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Feedback Preview */}
            {stats && stats?.recent_feedback?.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-gray-900">Recent Feedback</CardTitle>
                  <CardDescription>Your latest received feedback</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.recent_feedback.slice(0, 3).map((feedback, index) => (
                    <div
                      key={feedback.id}
                      className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {feedback.from_user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {feedback.from_user.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            {renderStars(feedback.stars, "h-4 w-4")}
                            <span className="text-sm text-gray-500">{formatDate(feedback.created_at)}</span>
                          </div>
                        </div>
                        {feedback.comment && (
                          <p className="text-sm text-gray-600 mt-1">{feedback.comment}</p>
                        )}
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <span>Skill: {feedback.swap.take_skill.name} ↔ {feedback.swap.give_skill.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Received Feedback Tab */}
          <TabsContent value="received" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">Filter Feedback</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                </div>
              </CardHeader>
              {showFilters && (
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stars</label>
                      <Select value={filters.stars?.toString() || ""} onValueChange={(value) => setFilters({...filters, stars: value ? parseInt(value) : undefined})}>
                        <SelectTrigger>
                          <SelectValue placeholder="All ratings" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All ratings</SelectItem>
                          <SelectItem value="5">5 stars</SelectItem>
                          <SelectItem value="4">4 stars</SelectItem>
                          <SelectItem value="3">3 stars</SelectItem>
                          <SelectItem value="2">2 stars</SelectItem>
                          <SelectItem value="1">1 star</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                      <Input
                        type="date"
                        value={filters.date_from || ""}
                        onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                      <Input
                        type="date"
                        value={filters.date_to || ""}
                        onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button onClick={applyFilters} disabled={receivedLoading}>
                      Apply Filters
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Feedback List */}
            <div className="space-y-4">
              {receivedFeedback.map((feedback, index) => (
                <Card
                  key={feedback.id}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {feedback.from_user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-medium text-gray-900">
                              {feedback.from_user.name}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {renderStars(feedback.stars)}
                              <span className="text-sm text-gray-500">{formatDate(feedback.created_at)}</span>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            {feedback.swap.status}
                          </Badge>
                        </div>
                        
                        {feedback.comment && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">{feedback.comment}</p>
                          </div>
                        )}
                        
                        <div className="mt-3 text-sm text-gray-600">
                          <p>
                            <strong>Skill Exchange:</strong> {feedback.swap.take_skill.name} ↔ {feedback.swap.give_skill.name}
                          </p>
                          <p className="mt-1">
                            <strong>Swap Date:</strong> {formatDate(feedback.swap.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {receivedFeedback.length === 0 && !receivedLoading && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
                    <p className="text-gray-600">
                      Complete some skill swaps to start receiving feedback from other users.
                    </p>
                  </CardContent>
                </Card>
              )}

              {receivedHasMore && (
                <div className="text-center">
                  <Button
                    onClick={loadMoreReceivedFeedback}
                    disabled={receivedLoading}
                    variant="outline"
                  >
                    {receivedLoading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Give Feedback Tab */}
          <TabsContent value="give" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900">Completed Swaps Awaiting Feedback</CardTitle>
                <CardDescription>Give feedback for your completed skill exchanges</CardDescription>
              </CardHeader>
              <CardContent>
                {availableSwaps.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed swaps</h3>
                    <p className="text-gray-600">
                      Complete some skill swaps to give feedback to other users.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableSwaps.map((swap, index) => (
                      <div
                        key={swap.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-green-100 text-green-600">
                              {(swap.requester?.name || swap.responder?.name || 'U').split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {swap.requester?.name || swap.responder?.name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {swap.give_skill?.name} ↔ {swap.take_skill?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Completed on {formatDate(swap.updated_at)}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCreateFeedback(swap)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Give Feedback
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {stats && (
              <>
                {/* Rating Distribution */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Rating Distribution</CardTitle>
                    <CardDescription>Breakdown of your received ratings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { stars: 5, count: stats.five_star_count, color: 'bg-green-500' },
                        { stars: 4, count: stats.four_star_count, color: 'bg-blue-500' },
                        { stars: 3, count: stats.three_star_count, color: 'bg-yellow-500' },
                        { stars: 2, count: stats.two_star_count, color: 'bg-orange-500' },
                        { stars: 1, count: stats.one_star_count, color: 'bg-red-500' },
                      ].map((rating) => {
                        const percentage = stats.total_feedback > 0 ? (rating.count / stats.total_feedback) * 100 : 0;
                        return (
                          <div key={rating.stars} className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 w-20">
                              <span className="text-sm font-medium">{rating.stars}</span>
                              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`${rating.color} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-sm text-gray-600 w-20 text-right">
                              {rating.count} ({percentage.toFixed(1)}%)
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSwap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Give Feedback</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Rate your experience with {selectedSwap.requester?.name || selectedSwap.responder?.name}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Skill: {selectedSwap.give_skill?.name} ↔ {selectedSwap.take_skill?.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                {renderClickableStars(feedbackStars, setFeedbackStars)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (Optional)
                </label>
                <Textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share your experience with this skill exchange..."
                  className="min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {feedbackComment.length}/500 characters
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => setShowFeedbackModal(false)}
                variant="outline"
                className="flex-1"
                disabled={submittingFeedback}
              >
                Cancel
              </Button>
              <Button
                onClick={submitFeedback}
                disabled={submittingFeedback}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackManager; 