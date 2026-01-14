import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Activity, Save, Download, Upload, Calendar, Check } from 'lucide-react';

const CryptoRiskDashboard = () => {
  const [saveMessages, setSaveMessages] = useState({});

  // Define indicator categories and their indicators
  const [indicators, setIndicators] = useState({
    onchain: {
      name: 'On-Chain',
      weight: 0.30,
      color: 'bg-blue-500',
      indicators: [
        { id: 'mvrv', name: 'MVRV Z-Score', value: 41.11, weight: 0.25, min: 0, max: 100, inverted: false, lastUpdated: null },
        { id: 'puell', name: 'Puell Multiple', value: 11.11, weight: 0.20, min: 0, max: 100, inverted: false, lastUpdated: null },
        { id: 'sopr', name: 'SOPR', value: 52.40, weight: 0.20, min: 0, max: 100, inverted: false, lastUpdated: null },
        { id: 'nupl', name: 'NUPL', value: 62.50, weight: 0.20, min: 0, max: 100, inverted: false, lastUpdated: null },
        { id: 'reserve', name: 'Reserve Risk', value: 55.80, weight: 0.15, min: 0, max: 100, inverted: false, lastUpdated: null }
      ]
    },
    price: {
      name: 'Price Metrics',
      weight: 0.25,
      color: 'bg-purple-500',
      indicators: [
        { id: 'pi_cycle', name: 'Pi Cycle Ratio', value: 37.54, weight: 0.35, min: 0, max: 100, inverted: false, lastUpdated: null },
        { id: 'mayer', name: 'Mayer Multiple', value: 9.39, weight: 0.25, min: 0, max: 100, inverted: false, lastUpdated: null },
        { id: 'realized_ext', name: 'Realized Price Extension', value: 45.34, weight: 0.25, min: 0, max: 100, inverted: false, lastUpdated: null },
        { id: 'rsi', name: '14 Day RSI', value: 118.33, weight: 0.15, min: 0, max: 100, inverted: false, lastUpdated: null }
      ]
    },
    macro: {
      name: 'Macro',
      weight: 0.20,
      color: 'bg-green-500',
      indicators: [
        { id: 'net_liq', name: 'Net Liquidity 12M Flow', value: 61.69, weight: 0.40, min: 0, max: 100, inverted: false, lastUpdated: null },
        { id: 'stable_dom', name: 'Stablecoin Dominance', value: 78.18, weight: 0.30, min: 0, max: 100, inverted: true, lastUpdated: null },
        { id: 'macro_ob', name: 'Macro Overbought/Oversold', value: 14.28, weight: 0.30, min: 0, max: 100, inverted: false, lastUpdated: null }
      ]
    },
    sentiment: {
      name: 'Sentiment',
      weight: 0.15,
      color: 'bg-orange-500',
      indicators: [
        { id: 'fear_crypto', name: 'Fear & Greed (Crypto)', value: 65.00, weight: 0.40, min: 0, max: 100, inverted: false, lastUpdated: null },
        { id: 'fear_stocks', name: 'Fear & Greed (Stocks)', value: 65.00, weight: 0.30, min: 0, max: 100, inverted: false, lastUpdated: null },
        { id: 'open_interest', name: 'Open Interest Risk', value: 63.50, weight: 0.30, min: 0, max: 100, inverted: false, lastUpdated: null }
      ]
    },
    supply: {
      name: 'Supply Dynamics',
      weight: 0.10,
      color: 'bg-cyan-500',
      indicators: [
        { id: 'lth_supply', name: 'LTH Supply Net Position', value: 33.25, weight: 0.35, min: 0, max: 100, inverted: true, lastUpdated: null },
        { id: 'sth_risk', name: 'STH Sell Side Risk', value: 2.44, weight: 0.35, min: 0, max: 100, inverted: false, lastUpdated: null },
        { id: 'hodl_waves', name: '1Y+ HODL Waves', value: 58.67, weight: 0.30, min: 0, max: 100, inverted: false, lastUpdated: null }
      ]
    }
  });

  // Load all indicators on mount
  useEffect(() => {
    const loadAllData = async () => {
      const newIndicators = { ...indicators };
      
      for (const [categoryKey, category] of Object.entries(newIndicators)) {
        for (let i = 0; i < category.indicators.length; i++) {
          const indicator = category.indicators[i];
          try {
            const saved = await window.storage.get(`indicator_${categoryKey}_${indicator.id}`);
            if (saved) {
              const parsed = JSON.parse(saved.value);
              newIndicators[categoryKey].indicators[i] = { ...indicator, ...parsed };
            }
          } catch (error) {
            console.log(`No saved data for ${indicator.id}`);
          }
        }
      }
      
      setIndicators(newIndicators);
    };
    
    loadAllData();
  }, []);

  // Calculate category risk scores
  const categoryScores = useMemo(() => {
    const scores = {};
    Object.entries(indicators).forEach(([key, category]) => {
      const totalWeight = category.indicators.reduce((sum, ind) => sum + ind.weight, 0);
      const weightedSum = category.indicators.reduce((sum, ind) => {
        const normalizedValue = ind.inverted ? (100 - ind.value) : ind.value;
        return sum + (normalizedValue * ind.weight);
      }, 0);
      scores[key] = weightedSum / totalWeight;
    });
    return scores;
  }, [indicators]);

  // Calculate overall risk score
  const overallRisk = useMemo(() => {
    const totalWeight = Object.values(indicators).reduce((sum, cat) => sum + cat.weight, 0);
    const weightedSum = Object.entries(indicators).reduce((sum, [key, cat]) => {
      return sum + (categoryScores[key] * cat.weight);
    }, 0);
    return weightedSum / totalWeight;
  }, [indicators, categoryScores]);

  // Get risk level and color
  const getRiskLevel = (score) => {
    if (score < 20) return { level: 'Very Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (score < 40) return { level: 'Low', color: 'text-green-500', bg: 'bg-green-50' };
    if (score < 60) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score < 80) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Very High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const updateIndicatorValue = (categoryKey, indicatorId, newValue) => {
    setIndicators(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        indicators: prev[categoryKey].indicators.map(ind =>
          ind.id === indicatorId ? { ...ind, value: parseFloat(newValue) } : ind
        )
      }
    }));
  };

  const updateIndicatorWeight = (categoryKey, indicatorId, newWeight) => {
    setIndicators(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        indicators: prev[categoryKey].indicators.map(ind =>
          ind.id === indicatorId ? { ...ind, weight: parseFloat(newWeight) } : ind
        )
      }
    }));
  };

  const updateCategoryWeight = (categoryKey, newWeight) => {
    setIndicators(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        weight: parseFloat(newWeight)
      }
    }));
  };

  const saveIndicator = async (categoryKey, indicatorId) => {
    const indicator = indicators[categoryKey].indicators.find(ind => ind.id === indicatorId);
    const now = new Date().toISOString();
    
    const dataToSave = {
      value: indicator.value,
      weight: indicator.weight,
      lastUpdated: now
    };
    
    try {
      await window.storage.set(`indicator_${categoryKey}_${indicatorId}`, JSON.stringify(dataToSave));
      
      // Update the indicator with the new timestamp
      setIndicators(prev => ({
        ...prev,
        [categoryKey]: {
          ...prev[categoryKey],
          indicators: prev[categoryKey].indicators.map(ind =>
            ind.id === indicatorId ? { ...ind, lastUpdated: now } : ind
          )
        }
      }));
      
      // Show success message
      const key = `${categoryKey}_${indicatorId}`;
      setSaveMessages(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setSaveMessages(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error('Error saving indicator:', error);
    }
  };

  const exportData = () => {
    const dataToExport = {
      indicators,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-risk-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          
          // Save each indicator individually
          for (const [categoryKey, category] of Object.entries(imported.indicators)) {
            for (const indicator of category.indicators) {
              const dataToSave = {
                value: indicator.value,
                weight: indicator.weight,
                lastUpdated: indicator.lastUpdated
              };
              await window.storage.set(`indicator_${categoryKey}_${indicator.id}`, JSON.stringify(dataToSave));
            }
          }
          
          setIndicators(imported.indicators);
        } catch (error) {
          console.error('Error importing data:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getUpdateColor = (dateString) => {
    if (!dateString) return 'text-gray-400';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now - date) / 3600000;
    
    if (diffHours < 24) return 'text-green-600';
    if (diffHours < 72) return 'text-yellow-600';
    return 'text-red-600';
  };

  const overallRiskLevel = getRiskLevel(overallRisk);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Crypto Risk Indicator</h1>
            <p className="text-gray-600">Customizable multi-factor risk assessment system</p>
          </div>
          
          {/* Export/Import Controls */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Download size={18} />
                Export All
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <Upload size={18} />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Risk Score */}
      <div className={`${overallRiskLevel.bg} rounded-xl p-8 mb-8 border-2 border-gray-200 shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Overall Market Risk</h2>
            <div className={`text-5xl font-bold ${overallRiskLevel.color}`}>
              {overallRisk.toFixed(1)}%
            </div>
          </div>
          <div className={`px-6 py-3 rounded-lg ${overallRiskLevel.color} bg-white border-2 border-current`}>
            <div className="text-2xl font-bold">{overallRiskLevel.level}</div>
          </div>
        </div>
        
        {/* Overall Risk Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
              style={{ width: `${overallRisk}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {Object.entries(indicators).map(([key, category]) => {
          const score = categoryScores[key];
          const riskLevel = getRiskLevel(score);
          
          return (
            <div key={key} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                  <h3 className="text-xl font-bold text-gray-800">{category.name}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Weight</div>
                    <input
                      type="number"
                      value={category.weight}
                      onChange={(e) => updateCategoryWeight(key, e.target.value)}
                      className="w-16 px-2 py-1 text-sm border rounded text-center"
                      step="0.05"
                      min="0"
                      max="1"
                    />
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${riskLevel.bg} ${riskLevel.color} font-bold`}>
                    {score.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              {/* Indicators */}
              <div className="space-y-3">
                {category.indicators.map((indicator) => {
                  const saveKey = `${key}_${indicator.id}`;
                  const isSaving = saveMessages[saveKey];
                  
                  return (
                    <div key={indicator.id} className="bg-gray-50 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700">
                            {indicator.name}
                            {indicator.inverted && <span className="text-xs text-gray-500 ml-1">(inv)</span>}
                          </span>
                          <div className={`text-xs ${getUpdateColor(indicator.lastUpdated)} mt-0.5`}>
                            Updated: {formatDate(indicator.lastUpdated)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={indicator.value}
                            onChange={(e) => updateIndicatorValue(key, indicator.id, e.target.value)}
                            className="w-16 px-2 py-1 text-xs border rounded text-center"
                            step="0.1"
                          />
                          <input
                            type="number"
                            value={indicator.weight}
                            onChange={(e) => updateIndicatorWeight(key, indicator.id, e.target.value)}
                            className="w-14 px-2 py-1 text-xs border rounded text-center bg-blue-50"
                            step="0.05"
                            min="0"
                            max="1"
                          />
                          <button
                            onClick={() => saveIndicator(key, indicator.id)}
                            className={`p-1.5 rounded transition-colors ${
                              isSaving 
                                ? 'bg-green-600 text-white' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            title="Save this indicator"
                          >
                            {isSaving ? <Check size={14} /> : <Save size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 transition-all duration-200"
                          style={{ width: `${indicator.inverted ? (100 - indicator.value) : indicator.value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Risk Levels Guide</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="bg-green-100 text-green-600 rounded-lg p-3 mb-2 font-bold">0-20%</div>
            <div className="text-sm text-gray-600">Very Low Risk</div>
          </div>
          <div className="text-center">
            <div className="bg-green-50 text-green-500 rounded-lg p-3 mb-2 font-bold">20-40%</div>
            <div className="text-sm text-gray-600">Low Risk</div>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 text-yellow-600 rounded-lg p-3 mb-2 font-bold">40-60%</div>
            <div className="text-sm text-gray-600">Moderate</div>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 text-orange-600 rounded-lg p-3 mb-2 font-bold">60-80%</div>
            <div className="text-sm text-gray-600">High Risk</div>
          </div>
          <div className="text-center">
            <div className="bg-red-100 text-red-600 rounded-lg p-3 mb-2 font-bold">80-100%</div>
            <div className="text-sm text-gray-600">Very High</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoRiskDashboard;