import React, { useState } from 'react';
import { Home, DollarSign, Calculator, ChevronDown, ChevronUp } from 'lucide-react';

const HomePriceEstimator = () => {
  const [targetHome, setTargetHome] = useState({
    address: '',
    bed: 3,
    bath: 2,
    buildingSqft: '',
    lotSqft: '',
    view: 'No',
    yearBuilt: 2000,
    acType: 'No',
    minisplitCount: 0,
    renovation: []
  });

  const [compareHomes, setCompareHomes] = useState([
    { address: '', bed: 3, bath: 2, buildingSqft: '', lotSqft: '', view: 'No', yearBuilt: 2000, acType: 'No', minisplitCount: 0, renovation: [], price: '' },
    { address: '', bed: 3, bath: 2, buildingSqft: '', lotSqft: '', view: 'No', yearBuilt: 2000, acType: 'No', minisplitCount: 0, renovation: [], price: '' },
    { address: '', bed: 3, bath: 2, buildingSqft: '', lotSqft: '', view: 'No', yearBuilt: 2000, acType: 'No', minisplitCount: 0, renovation: [], price: '' }
  ]);

  const [expandedSections, setExpandedSections] = useState({
    target: true,
    compare0: false,
    compare1: false,
    compare2: false
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const bedOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  const bathOptions = [];
  for (let i = 0; i <= 10; i += 0.25) {
    bathOptions.push(i);
  }
  const yearOptions = Array.from({ length: 126 }, (_, i) => 2025 - i);
  const renovationOptions = ['Roofing', 'Siding', 'Decking', 'Flooring', 'Kitchen', 'Bathroom'];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleTargetChange = (field, value) => {
    setTargetHome(prev => ({ ...prev, [field]: value }));
  };

  const handleCompareChange = (index, field, value) => {
    const updated = [...compareHomes];
    updated[index] = { ...updated[index], [field]: value };
    setCompareHomes(updated);
  };

  const handleRenovationToggle = (isTarget, index, option) => {
    if (isTarget) {
      const current = targetHome.renovation;
      const updated = current.includes(option)
        ? current.filter(r => r !== option)
        : [...current, option];
      setTargetHome(prev => ({ ...prev, renovation: updated }));
    } else {
      const updated = [...compareHomes];
      const current = updated[index].renovation;
      updated[index].renovation = current.includes(option)
        ? current.filter(r => r !== option)
        : [...current, option];
      setCompareHomes(updated);
    }
  };

  const calculateComparison = (target, compare) => {
    let adjustedPrice = parseFloat(compare.price);
    const adjustments = [];

    const bedDiff = compare.bed - target.bed;
    if (bedDiff !== 0) {
      const adjustment = bedDiff * 2000;
      adjustedPrice -= adjustment;
      adjustments.push({
        item: 'Bedrooms',
        detail: `Target: ${target.bed}, Compare: ${compare.bed}`,
        adjustment: -adjustment
      });
    }

    const bathDiff = compare.bath - target.bath;
    if (bathDiff !== 0) {
      const adjustment = bathDiff * 1000;
      adjustedPrice -= adjustment;
      adjustments.push({
        item: 'Bathrooms',
        detail: `Target: ${target.bath}, Compare: ${compare.bath}`,
        adjustment: -adjustment
      });
    }

    const buildingSqftDiff = parseFloat(compare.buildingSqft) - parseFloat(target.buildingSqft);
    if (Math.abs(buildingSqftDiff) >= 250) {
      const intervals = Math.round(buildingSqftDiff / 500);
      const adjustment = intervals * 1000;
      adjustedPrice -= adjustment;
      adjustments.push({
        item: 'Building Size',
        detail: `Target: ${target.buildingSqft} sqft, Compare: ${compare.buildingSqft} sqft`,
        adjustment: -adjustment
      });
    }

    const lotSqftDiff = parseFloat(compare.lotSqft) - parseFloat(target.lotSqft);
    if (Math.abs(lotSqftDiff) >= 500) {
      const intervals = Math.round(lotSqftDiff / 1000);
      const adjustment = intervals * 1000;
      adjustedPrice -= adjustment;
      adjustments.push({
        item: 'Lot Size',
        detail: `Target: ${target.lotSqft} sqft, Compare: ${compare.lotSqft} sqft`,
        adjustment: -adjustment
      });
    }

    if (target.view !== compare.view) {
      const adjustment = target.view === 'Yes' ? 2000 : -2000;
      adjustedPrice += adjustment;
      adjustments.push({
        item: 'View',
        detail: `Target: ${target.view}, Compare: ${compare.view}`,
        adjustment: adjustment
      });
    }

    const yearDiff = compare.yearBuilt - target.yearBuilt;
    if (Math.abs(yearDiff) >= 2.5) {
      const intervals = Math.round(yearDiff / 5);
      const adjustment = intervals * 1000;
      adjustedPrice -= adjustment;
      adjustments.push({
        item: 'Year Built',
        detail: `Target: ${target.yearBuilt}, Compare: ${compare.yearBuilt}`,
        adjustment: -adjustment
      });
    }

    const targetAcValue = target.acType === 'Minisplit' 
      ? target.minisplitCount * 2000 
      : (target.acType === 'Central' ? 10000 : 0);
    const compareAcValue = compare.acType === 'Minisplit' 
      ? compare.minisplitCount * 2000 
      : (compare.acType === 'Central' ? 10000 : 0);
    
    if (targetAcValue !== compareAcValue) {
      const adjustment = targetAcValue - compareAcValue;
      adjustedPrice += adjustment;
      adjustments.push({
        item: 'AC System',
        detail: `Target: ${target.acType}${target.acType === 'Minisplit' ? ` (${target.minisplitCount})` : ''}, Compare: ${compare.acType}${compare.acType === 'Minisplit' ? ` (${compare.minisplitCount})` : ''}`,
        adjustment: adjustment
      });
    }

    const renovationValues = {
      'Roofing': 15000,
      'Siding': 10000,
      'Decking': 5000,
      'Flooring': 5000,
      'Kitchen': 5000,
      'Bathroom': 5000
    };

    const targetRenovationValue = target.renovation.reduce((sum, r) => sum + renovationValues[r], 0);
    const compareRenovationValue = compare.renovation.reduce((sum, r) => sum + renovationValues[r], 0);

    if (targetRenovationValue !== compareRenovationValue) {
      const adjustment = targetRenovationValue - compareRenovationValue;
      adjustedPrice += adjustment;
      adjustments.push({
        item: 'Renovation',
        detail: `Target: ${target.renovation.join(', ') || 'None'}, Compare: ${compare.renovation.join(', ') || 'None'}`,
        adjustment: adjustment
      });
    }

    return { adjustedPrice, adjustments };
  };

  const handleEstimate = async () => {
    setLoading(true);
    
    if (!targetHome.address || !targetHome.buildingSqft || !targetHome.lotSqft) {
      alert('Please fill in all required fields for the target home');
      setLoading(false);
      return;
    }

    for (let i = 0; i < compareHomes.length; i++) {
      const home = compareHomes[i];
      if (!home.address || !home.buildingSqft || !home.lotSqft || !home.price) {
        alert(`Please fill in all required fields for Compare Home ${i + 1}`);
        setLoading(false);
        return;
      }
    }

    const comparisons = compareHomes.map((compare, idx) => {
      const { adjustedPrice, adjustments } = calculateComparison(targetHome, compare);
      return {
        label: `Compare ${idx + 1}`,
        address: compare.address,
        originalPrice: parseFloat(compare.price),
        adjustedPrice,
        adjustments
      };
    });

    const averagePrice = comparisons.reduce((sum, c) => sum + c.adjustedPrice, 0) / comparisons.length;

    setResult({
      comparisons,
      finalPrice: averagePrice
    });

    try {
      await saveToGoogleSheets(comparisons, averagePrice);
    } catch (error) {
      console.error('Error saving to Google Sheets:', error);
    }

    setLoading(false);
    
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const saveToGoogleSheets = async (comparisons, finalPrice) => {
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzdND36wjIlyK_dcdqQmet8mupaLhbxEMCOeplm3XxBPufRI2gVCtDjSOqjXTuWTVge/exec';
    
    const data = {
      targetAddress: targetHome.address,
      targetBed: targetHome.bed,
      targetBath: targetHome.bath,
      targetBuildingSqft: targetHome.buildingSqft,
      targetAcType: targetHome.acType,
      targetMinisplitCount: targetHome.minisplitCount,
      targetLotSqft: targetHome.lotSqft,
      targetView: targetHome.view,
      targetYearBuilt: targetHome.yearBuilt,
      targetRenovation: targetHome.renovation.join(', '),
      compare1Address: compareHomes[0].address,
      compare1Bed: compareHomes[0].bed,
      compare1Bath: compareHomes[0].bath,
      compare1AcType: compareHomes[0].acType,
      compare1MinisplitCount: compareHomes[0].minisplitCount,
      compare1BuildingSqft: compareHomes[0].buildingSqft,
      compare1LotSqft: compareHomes[0].lotSqft,
      compare1View: compareHomes[0].view,
      compare1YearBuilt: compareHomes[0].yearBuilt,
      compare1Renovation: compareHomes[0].renovation.join(', '),
      compare1Price: compareHomes[0].price,
      compare2Address: compareHomes[1].address,
      compare2Bed: compareHomes[1].bed,
      compare2Bath: compareHomes[1].bath,
      compare2AcType: compareHomes[1].acType,
      compare2MinisplitCount: compareHomes[1].minisplitCount,
      compare2BuildingSqft: compareHomes[1].buildingSqft,
      compare2LotSqft: compareHomes[1].lotSqft,
      compare2View: compareHomes[1].view,
      compare2YearBuilt: compareHomes[1].yearBuilt,
      compare2Renovation: compareHomes[1].renovation.join(', '),
      compare2Price: compareHomes[1].price,
      compare3Address: compareHomes[2].address,
      compare3Bed: compareHomes[2].bed,
      compare3Bath: compareHomes[2].bath,
      compare3AcType: compareHomes[2].acType,
      compare3MinisplitCount: compareHomes[2].minisplitCount,
      compare3BuildingSqft: compareHomes[2].buildingSqft,
      compare3LotSqft: compareHomes[2].lotSqft,
      compare3View: compareHomes[2].view,
      compare3YearBuilt: compareHomes[2].yearBuilt,
      compare3Renovation: compareHomes[2].renovation.join(', '),
      compare3Price: compareHomes[2].price,
      finalPrice: finalPrice.toFixed(2)
    };

    try {
      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error saving to Google Sheets:', error);
      throw error;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const renderHomeInputs = (home, isTarget, index = null) => {
    const handleChange = isTarget ? handleTargetChange : (field, value) => handleCompareChange(index, field, value);
    
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            value={home.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full p-3 border rounded-lg text-base"
            placeholder="Enter address"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Bedrooms</label>
            <select
              value={home.bed}
              onChange={(e) => handleChange('bed', parseInt(e.target.value))}
              className="w-full p-3 border rounded-lg text-base"
            >
              {bedOptions.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bathrooms</label>
            <select
              value={home.bath}
              onChange={(e) => handleChange('bath', parseFloat(e.target.value))}
              className="w-full p-3 border rounded-lg text-base"
            >
              {bathOptions.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Building (sq ft)</label>
            <input
              type="number"
              value={home.buildingSqft}
              onChange={(e) => handleChange('buildingSqft', e.target.value)}
              className="w-full p-3 border rounded-lg text-base"
              placeholder="1800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lot (sq ft)</label>
            <input
              type="number"
              value={home.lotSqft}
              onChange={(e) => handleChange('lotSqft', e.target.value)}
              className="w-full p-3 border rounded-lg text-base"
              placeholder="7000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">View</label>
            <div className="flex gap-4 p-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={home.view === 'Yes'}
                  onChange={() => handleChange('view', 'Yes')}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={home.view === 'No'}
                  onChange={() => handleChange('view', 'No')}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year Built</label>
            <select
              value={home.yearBuilt}
              onChange={(e) => handleChange('yearBuilt', parseInt(e.target.value))}
              className="w-full p-3 border rounded-lg text-base"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">AC Type</label>
          <select
            value={home.acType}
            onChange={(e) => handleChange('acType', e.target.value)}
            className="w-full p-3 border rounded-lg text-base"
          >
            <option value="No">No</option>
            <option value="Minisplit">Minisplit</option>
            <option value="Central">Central</option>
          </select>
          {home.acType === 'Minisplit' && (
            <input
              type="number"
              value={home.minisplitCount}
              onChange={(e) => handleChange('minisplitCount', parseInt(e.target.value) || 0)}
              className="w-full p-3 border rounded-lg text-base mt-2"
              placeholder="Number of minisplits"
              min="0"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Renovation</label>
          <div className="grid grid-cols-2 gap-2">
            {renovationOptions.map(option => (
              <label key={option} className="flex items-center p-2">
                <input
                  type="checkbox"
                  checked={home.renovation.includes(option)}
                  onChange={() => handleRenovationToggle(isTarget, index, option)}
                  className="mr-2"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {!isTarget && (
          <div>
            <label className="block text-sm font-medium mb-1">Listing Price</label>
            <input
              type="number"
              value={home.price}
              onChange={(e) => handleChange('price', e.target.value)}
              className="w-full p-3 border rounded-lg text-base"
              placeholder="500000"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Home className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Home Price Estimator</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Compare properties and get an accurate price estimate</p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => toggleSection('target')}
              className="w-full p-4 flex items-center justify-between bg-green-50"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800">Target Home</h2>
              </div>
              {expandedSections.target ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.target && (
              <div className="p-4">
                {renderHomeInputs(targetHome, true)}
              </div>
            )}
          </div>

          {compareHomes.map((home, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => toggleSection(`compare${idx}`)}
                className="w-full p-4 flex items-center justify-between bg-blue-50"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-800">Compare Home {idx + 1}</h2>
                </div>
                {expandedSections[`compare${idx}`] ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections[`compare${idx}`] && (
                <div className="p-4">
                  {renderHomeInputs(home, false, idx)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={handleEstimate}
            disabled={loading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg"
>
  {loading ? 'Loading...' : 'Submit'}
</button>
