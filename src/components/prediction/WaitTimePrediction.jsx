import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
  Brain,
  BarChart3,
  Calendar,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { fadeInUp, chartEnter, pulse } from "../../lib/motion";

const WaitTimePrediction = ({
  hospitalId,
  counterId,
  prediction,
  loading = false,
  onRefresh,
  showInsights = true,
  className
}) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("today");
  const [animatedWaitTime, setAnimatedWaitTime] = useState(0);

  const timeFrameOptions = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" }
  ];

  // Animate wait time counter
  useEffect(() => {
    if (prediction?.predictedWaitTime) {
      let start = 0;
      const end = prediction.predictedWaitTime;
      const duration = 1000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setAnimatedWaitTime(end);
          clearInterval(timer);
        } else {
          setAnimatedWaitTime(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [prediction?.predictedWaitTime]);

  const getWaitTimeColor = (waitTime) => {
    if (waitTime <= 15) return "text-green-600 bg-green-50 border-green-200";
    if (waitTime <= 30) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
      case "high":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "medium":
        return <BarChart3 className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const LoadingSkeleton = () => (
    <motion.div
      className="animate-pulse space-y-4"
      variants={pulse}
      animate="animate"
    >
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      <div className="h-16 bg-gray-200 rounded"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No prediction data available</p>
          <Button onClick={onRefresh} variant="outline" className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      className={className}
      variants={cardVariants}
      initial="initial"
      animate="animate"
    >
      <Card className="relative overflow-hidden">
        {/* AI Badge */}
        <motion.div
          className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Brain className="h-3 w-3 mr-1" />
          AI Powered
        </motion.div>

        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-6 w-6 mr-2 text-blue-600" />
            Wait Time Prediction
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Last updated: {new Date(prediction.lastUpdated).toLocaleTimeString()}
            </p>
            <Button
              onClick={onRefresh}
              variant="ghost"
              size="sm"
              className="text-blue-600"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Prediction Display */}
          <motion.div
            className="text-center"
            variants={itemVariants}
          >
            <div className="relative">
              {/* Animated Circle Progress */}
              <motion.div
                className="w-32 h-32 mx-auto relative"
                variants={chartEnter}
              >
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                  {/* Background circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 56 * (1 - (prediction.predictedWaitTime / 60))
                    }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                </svg>

                {/* Wait time display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      className="text-3xl font-bold text-gray-900"
                      key={animatedWaitTime}
                    >
                      {animatedWaitTime}
                    </motion.div>
                    <div className="text-sm text-gray-500">minutes</div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className={cn(
                "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border mt-4",
                getWaitTimeColor(prediction.predictedWaitTime)
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Target className="h-4 w-4 mr-2" />
              Predicted Wait Time
            </motion.div>
          </motion.div>

          {/* Confidence Score */}
          <motion.div
            className="bg-gray-50 p-4 rounded-lg"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Prediction Confidence</span>
              <span className={cn(
                "text-sm font-bold",
                getConfidenceColor(prediction.confidence)
              )}>
                {Math.round(prediction.confidence * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={cn(
                  "h-2 rounded-full",
                  prediction.confidence >= 0.8 ? "bg-green-500" :
                  prediction.confidence >= 0.6 ? "bg-yellow-500" : "bg-red-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${prediction.confidence * 100}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Current vs Predicted */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            variants={itemVariants}
          >
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {prediction.currentWaitTime}
              </div>
              <div className="text-xs text-blue-600">Current Wait</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {prediction.predictedWaitTime}
              </div>
              <div className="text-xs text-purple-600">Predicted Wait</div>
            </div>
          </motion.div>

          {/* Factors Affecting Wait Time */}
          {prediction.factors && (
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Factors Affecting Wait Time
              </h4>
              <div className="space-y-3">
                {prediction.factors.map((factor, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center">
                      {getImpactIcon(factor.impact)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {factor.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {factor.value}
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      factor.impact === "high" && "bg-red-100 text-red-700",
                      factor.impact === "medium" && "bg-yellow-100 text-yellow-700",
                      factor.impact === "low" && "bg-green-100 text-green-700"
                    )}>
                      {factor.impact}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Hourly Predictions Chart */}
          {prediction.hourlyPredictions && showInsights && (
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Hourly Predictions
              </h4>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {prediction.hourlyPredictions.map((hourData, index) => {
                  const isCurrentHour = hourData.hour === new Date().getHours();
                  return (
                    <motion.div
                      key={hourData.hour}
                      className={cn(
                        "flex-shrink-0 text-center p-2 rounded-lg border",
                        isCurrentHour
                          ? "bg-blue-100 border-blue-300"
                          : "bg-gray-50 border-gray-200"
                      )}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                    >
                      <div className="text-xs text-gray-600">
                        {hourData.hour}:00
                      </div>
                      <motion.div
                        className={cn(
                          "text-sm font-bold mt-1",
                          isCurrentHour ? "text-blue-600" : "text-gray-900"
                        )}
                        animate={isCurrentHour ? {
                          scale: [1, 1.1, 1],
                          transition: { duration: 2, repeat: Infinity }
                        } : {}}
                      >
                        {hourData.waitTime}m
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* AI Recommendations */}
          {prediction.recommendations && (
            <motion.div
              className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100"
              variants={itemVariants}
            >
              <h4 className="text-lg font-semibold mb-3 flex items-center text-blue-900">
                <Brain className="h-5 w-5 mr-2" />
                AI Recommendations
              </h4>
              <div className="space-y-2">
                {prediction.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start text-sm text-blue-800"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                    {recommendation}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Real-time Updates Indicator */}
          <motion.div
            className="flex items-center justify-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full mr-2"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            Live predictions updated every 2 minutes
          </motion.div>
        </CardContent>

        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 2 }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default WaitTimePrediction;
