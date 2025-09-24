import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, Plus, Upload, ShoppingCart, Package, X, Check, AlertCircle } from 'lucide-react';

const BundleBuilder = () => {
  const [expandedSteps, setExpandedSteps] = useState({ 1: true });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [mainOrder, setMainOrder] = useState({
    type: 'Gildan Softstyle T-Shirt',
    quantity: 0,
    colorOrders: [{
      id: Date.now(),
      color: '',
      sizes: {},
      quantity: 0
    }]
  });

  const [addOns, setAddOns] = useState([]);
  
  const [designDetails, setDesignDetails] = useState({
    frontColors: 1,
    hasBack: false,
    backColors: 0,
    designFile: null,
    designFileName: ''
  });

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  const [shippingMethod, setShippingMethod] = useState({
    selectedDate: '',
    selectedMethod: 'standard'
  });

  const standardColors = [
    { name: 'White', code: '#FFFFFF', class: 'bg-white border-gray-300' },
    { name: 'Black', code: '#000000', class: 'bg-black' }
  ];

  const additionalColors = {
    'Gildan Softstyle T-Shirt': [
      { name: 'Cardinal Red', code: '#C5282F' },
      { name: 'Carolina Blue', code: '#7FB3D3' },
      { name: 'Charcoal', code: '#36454F' },
      { name: 'Forest Green', code: '#013220' },
      { name: 'Gold', code: '#FFD700' },
      { name: 'Navy', code: '#000080' },
      { name: 'Orange', code: '#FF8C00' },
      { name: 'Purple', code: '#663399' },
      { name: 'Red', code: '#DC143C' },
      { name: 'Royal', code: '#4169E1' }
    ],
    'Gildan Long Sleeve': [
      { name: 'Ash', code: '#B2BEB5' },
      { name: 'Cardinal Red', code: '#C5282F' },
      { name: 'Charcoal', code: '#36454F' },
      { name: 'Forest Green', code: '#013220' },
      { name: 'Navy', code: '#000080' },
      { name: 'Red', code: '#DC143C' }
    ],
    'Gildan Hooded Sweatshirt': [
      { name: 'Ash', code: '#B2BEB5' },
      { name: 'Cardinal Red', code: '#C5282F' },
      { name: 'Charcoal', code: '#36454F' },
      { name: 'Forest Green', code: '#013220' },
      { name: 'Gold', code: '#FFD700' },
      { name: 'Navy', code: '#000080' }
    ]
  };

  const allColors = [...standardColors, ...(additionalColors[mainOrder.type] || [])];

  const addOnOptions = [
    { type: 'Hooded Sweatshirt', price: 18.00, description: 'Gildan 18500 Hoodie' },
    { type: 'Embroidered Hat', price: 14.00, description: 'Richardson 112 Hat (min. 6 per order)' },
    { type: 'Long Sleeve', price: 11.00, description: 'Gildan 64400 Long Sleeve' },
    { type: 'Crewneck Sweatshirt', price: 14.50, description: 'Gildan 18000 Crewneck' },
    { type: 'Embroidered Polo', price: 18.50, description: 'TT51 Polo' }
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
  const PREMIUM_COLOR_UPCHARGE = 0.30;

  const packageOptions = [
    { 
      name: 'Gildan Softstyle T-Shirt',
      pricing: { 'XS': 3.99, 'S': 3.99, 'M': 3.99, 'L': 3.99, 'XL': 3.99, '2XL': 6.99, '3XL': 7.99, '4XL': 7.99, '5XL': 7.99 }
    },
    { 
      name: 'Gildan Hooded Sweatshirt',
      pricing: { 'XS': 15.00, 'S': 15.00, 'M': 15.00, 'L': 15.00, 'XL': 15.00, '2XL': 18.00, '3XL': 20.00, '4XL': 20.00, '5XL': 20.00 }
    },
    { 
      name: 'Gildan Long Sleeve',
      pricing: { 'XS': 9.98, 'S': 9.98, 'M': 9.98, 'L': 9.98, 'XL': 9.98, '2XL': 12.25, '3XL': 13.25, '4XL': 13.25, '5XL': 13.25 }
    }
  ];

  const getCurrentPricing = useCallback((size) => {
    const currentPackage = packageOptions.find(pkg => pkg.name === mainOrder.type);
    return currentPackage ? currentPackage.pricing[size] : 0;
  }, [mainOrder.type]);

  const addColorOrder = useCallback(() => {
    setMainOrder(prev => ({
      ...prev,
      colorOrders: [...prev.colorOrders, {
        id: Date.now(),
        color: '',
        sizes: {},
        quantity: 0
      }]
    }));
  }, []);

  const removeColorOrder = useCallback((id) => {
    setMainOrder(prev => ({
      ...prev,
      colorOrders: prev.colorOrders.filter(order => order.id !== id)
    }));
  }, []);

  const updateColorOrderColor = useCallback((id, color) => {
    setMainOrder(prev => ({
      ...prev,
      colorOrders: prev.colorOrders.map(order =>
        order.id === id ? { ...order, color } : order
      )
    }));
  }, []);

  const updateColorOrderSizes = useCallback((id, size, value) => {
    const quantity = Math.max(0, parseInt(value) || 0);
    setMainOrder(prev => ({
      ...prev,
      colorOrders: prev.colorOrders.map(order => {
        if (order.id === id) {
          const newSizes = { ...order.sizes, [size]: quantity };
          const total = Object.values(newSizes).reduce((sum, qty) => sum + qty, 0);
          return { ...order, sizes: newSizes, quantity: total };
        }
        return order;
      })
    }));
  }, []);

  React.useEffect(() => {
    const totalQuantity = mainOrder.colorOrders.reduce((sum, order) => sum + order.quantity, 0);
    setMainOrder(prev => ({ ...prev, quantity: totalQuantity }));
  }, [mainOrder.colorOrders]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^\+?[\d\s\-\(\)]+$/;
    return phone.length >= 10 && re.test(phone);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (mainOrder.colorOrders.some(order => !order.color)) {
          newErrors.color = 'Please select a color for all color sections';
        }
        if (mainOrder.quantity === 0) {
          newErrors.quantity = 'Please specify quantities for sizes';
        }
        break;
      case 4:
        if (!shippingMethod.selectedDate) {
          newErrors.shipping = 'Please select a shipping option';
        }
        break;
      case 5:
        if (!customerInfo.name.trim()) newErrors.name = 'Name is required';
        if (!customerInfo.email.trim()) newErrors.email = 'Email is required';
        else if (!validateEmail(customerInfo.email)) newErrors.email = 'Please enter a valid email';
        if (!customerInfo.phone.trim()) newErrors.phone = 'Phone is required';
        else if (!validatePhone(customerInfo.phone)) newErrors.phone = 'Please enter a valid phone number';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleStep = useCallback((step) => {
    setExpandedSteps(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  }, []);

  const addAddOn = useCallback((type) => {
    const option = addOnOptions.find(opt => opt.type === type);
    const newAddOn = {
      id: Date.now(),
      type,
      quantity: 1,
      color: 'White',
      sizes: { 'M': 1 },
      price: option.price
    };
    setAddOns(prev => [...prev, newAddOn]);
  }, []);

  const removeAddOn = useCallback((id) => {
    setAddOns(prev => prev.filter(addon => addon.id !== id));
  }, []);

  const updateAddOnSizes = useCallback((id, size, value) => {
    const quantity = Math.max(0, parseInt(value) || 0);
    setAddOns(prev => prev.map(addon => {
      if (addon.id === id) {
        const newSizes = { ...addon.sizes, [size]: quantity };
        const total = Object.values(newSizes).reduce((sum, qty) => sum + qty, 0);
        return { ...addon, sizes: newSizes, quantity: total };
      }
      return addon;
    }));
  }, []);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024;
      
      if (!validTypes.includes(file.type)) {
        alert('Please upload an image file (JPEG, PNG, GIF) or PDF');
        return;
      }
      
      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setDesignDetails(prev => ({
        ...prev,
        designFile: file,
        designFileName: file.name
      }));
    }
  }, []);

  const calculations = useMemo(() => {
    const mainTotal = mainOrder.colorOrders.reduce((sum, order) => {
      const orderTotal = Object.entries(order.sizes).reduce((sizeSum, [size, qty]) => {
        const basePrice = getCurrentPricing(size);
        const isAdditionalColor = !standardColors.some(color => color.name === order.color);
        const colorUpcharge = isAdditionalColor ? PREMIUM_COLOR_UPCHARGE : 0;
        return sizeSum + (qty * (basePrice + colorUpcharge));
      }, 0);
      return sum + orderTotal;
    }, 0);
    
    const addOnTotal = addOns.reduce((sum, addon) => sum + (addon.quantity * addon.price), 0);
    const subtotal = mainTotal + addOnTotal;
    const totalItems = mainOrder.quantity + addOns.reduce((sum, addon) => sum + addon.quantity, 0);
    
    let shippingCost = 0;
    if (shippingMethod.selectedDate) {
      const shippingRates = {
        '2025-10-02': 2.93,
        '2025-10-03': 2.54,
        '2025-10-06': 1.83,
        '2025-10-14': 0
      };
      shippingCost = (shippingRates[shippingMethod.selectedDate] || 0) * totalItems;
    }
    
    const finalTotal = subtotal + shippingCost;
    const perUnitPrice = totalItems > 0 ? finalTotal / totalItems : 0;
    
    const mainColorUpcharge = mainOrder.colorOrders.reduce((sum, order) => {
      const isAdditionalColor = !standardColors.some(color => color.name === order.color);
      return sum + (isAdditionalColor ? order.quantity * PREMIUM_COLOR_UPCHARGE : 0);
    }, 0);
    
    return {
      subtotal,
      totalItems,
      perUnitPrice,
      mainTotal,
      addOnTotal,
      mainColorUpcharge,
      shippingCost,
      finalTotal
    };
  }, [mainOrder, addOns, shippingMethod, getCurrentPricing]);

  const handleSubmit = async () => {
    let isValid = true;
    for (let step = 1; step <= 5; step++) {
      if (!validateStep(step)) {
        isValid = false;
        if (!expandedSteps[step]) {
          toggleStep(step);
        }
      }
    }
    
    if (!isValid) {
      alert('Please complete all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Order submitted successfully! We will contact you within 24 hours with your proof.');
      
      setMainOrder({ 
        type: 'Gildan Softstyle T-Shirt', 
        quantity: 0, 
        colorOrders: [{ id: Date.now(), color: '', sizes: {}, quantity: 0 }]
      });
      setAddOns([]);
      setDesignDetails({ frontColors: 1, hasBack: false, backColors: 0, designFile: null, designFileName: '' });
      setShippingMethod({ selectedDate: '', selectedMethod: 'standard' });
      setCustomerInfo({ name: '', email: '', phone: '', company: '' });
      setErrors({});
      setExpandedSteps({ 1: true });
    } catch (error) {
      alert('Error submitting order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-center text-sm font-medium">
        Free Proofs For Approval Prior To Production + Free Shipping
      </div>
      
      <div className="text-center py-6 bg-slate-800">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          5 Boys Apparel
        </h1>
        <p className="text-gray-400 mt-2">Custom Apparel Made Easy</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-600">
              <h3 className="text-xl font-bold mb-6 text-center">How It Works</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="bg-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">1</div>
                  <h4 className="font-semibold text-sm mb-2">Choose Package</h4>
                  <p className="text-xs text-gray-400">Pick your main package, colors, and enter sizes</p>
                </div>
                <div className="text-center">
                  <div className="bg-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">2</div>
                  <h4 className="font-semibold text-sm mb-2">Add Items</h4>
                  <p className="text-xs text-gray-400">Add any add-on items with the same design</p>
                </div>
                <div className="text-center">
                  <div className="bg-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">3</div>
                  <h4 className="font-semibold text-sm mb-2">Upload Art</h4>
                  <p className="text-xs text-gray-400">Upload artwork and choose ink colors</p>
                </div>
                <div className="text-center">
                  <div className="bg-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">4</div>
                  <h4 className="font-semibold text-sm mb-2">Submit Order</h4>
                  <p className="text-xs text-gray-400">Enter info and submit for approval</p>
                </div>
              </div>
              
              <div className="border-t border-slate-700 pt-4 mt-6">
                <div className="bg-blue-600 bg-opacity-20 border border-blue-500 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-300 text-sm mb-2">What Happens Next:</h4>
                  <ul className="text-xs text-blue-200 space-y-1">
                    <li>• Our sales team will contact you within 24 hours</li>
                    <li>• We will send you a detailed invoice and design proofs</li>
                    <li>• <strong>No payment required until you approve everything</strong></li>
                    <li>• Additional costs apply for extra ink colors and back prints</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="font-semibold mb-4">Progress</h3>
              <div className="space-y-3">
                {[
                  { step: 1, label: 'Main Product', required: true },
                  { step: 2, label: 'Add-ons', required: false },
                  { step: 3, label: 'Artwork', required: false },
                  { step: 4, label: 'Shipping', required: true },
                  { step: 5, label: 'Contact Info', required: true }
                ].map(({ step, label, required }) => {
                  const isComplete = step === 1 ? mainOrder.colorOrders.every(order => order.color) && mainOrder.quantity > 0 :
                                   step === 4 ? shippingMethod.selectedDate :
                                   step === 5 ? customerInfo.name && customerInfo.email && customerInfo.phone : true;
                  return (
                    <div key={step} className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isComplete ? 'bg-emerald-600' : required ? 'bg-teal-600' : 'bg-slate-600'
                      }`}>
                        {isComplete ? <Check className="w-3 h-3" /> : step}
                      </div>
                      <span className={`text-sm ${isComplete ? 'text-emerald-400' : 'text-gray-300'}`}>
                        {label} {required && <span className="text-teal-400">*</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="mb-6">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm inline-block mb-3 font-medium">
                Exclusive Limited-time Deal
              </div>
              <h2 className="text-3xl font-bold mb-2">Custom Bundle Package</h2>
              <p className="text-gray-300">Build your perfect apparel package with multiple colors and sizes</p>
            </div>

            <div className="bg-slate-700 rounded-lg overflow-hidden shadow-lg">
              <button
                onClick={() => toggleStep(1)}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-600 hover:bg-slate-500 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">STEP 1</span>
                  <span className="font-semibold">Main Product & Quantity</span>
                  <span className="text-teal-400">*</span>
                </div>
                <ChevronDown className={`w-5 h-5 transform transition-transform ${expandedSteps[1] ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedSteps[1] && (
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Type</label>
                    <select
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      value={mainOrder.type}
                      onChange={(e) => setMainOrder({...mainOrder, type: e.target.value})}
                    >
                      <option value="Gildan Softstyle T-Shirt">Gildan Softstyle T-Shirt (100 pc package - $399)</option>
                      <option value="Gildan Hooded Sweatshirt">Gildan Hooded Sweatshirt (50 pc package - $750)</option>
                      <option value="Gildan Long Sleeve">Gildan Long Sleeve (50 pc package - $499)</option>
                    </select>
                  </div>

                  {errors.color && <p className="text-red-400 text-sm">{errors.color}</p>}
                  {errors.quantity && <p className="text-red-400 text-sm">{errors.quantity}</p>}

                  {mainOrder.colorOrders.map((colorOrder, index) => (
                    <div key={colorOrder.id} className="space-y-4 border border-slate-600 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          {index === 0 ? 'Color Selection' : `Additional Color ${index}`}
                        </h3>
                        {index > 0 && (
                          <button
                            onClick={() => removeColorOrder(colorOrder.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div>
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-emerald-400 mb-2">Standard Colors (No Extra Cost)</h4>
                          <div className="flex space-x-3">
                            {standardColors.map(color => (
                              <button
                                key={color.name}
                                onClick={() => updateColorOrderColor(colorOrder.id, color.name)}
                                className={`w-12 h-12 rounded-full border-4 transition-all hover:scale-110 ${
                                  colorOrder.color === color.name ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-gray-500 hover:border-gray-400'
                                } ${color.class}`}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-orange-400 mb-2">
                            Additional Colors (+$0.30 per piece)
                          </h4>
                          <div className="bg-slate-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                            <div className="grid grid-cols-5 gap-3">
                              {(additionalColors[mainOrder.type] || []).map(color => (
                                <button
                                  key={color.name}
                                  onClick={() => updateColorOrderColor(colorOrder.id, color.name)}
                                  className={`group flex flex-col items-center p-2 rounded-lg transition-all hover:bg-slate-700 ${
                                    colorOrder.color === color.name ? 'bg-slate-600 ring-2 ring-emerald-500' : 'hover:scale-105'
                                  }`}
                                  title={color.name}
                                >
                                  <div 
                                    className={`w-8 h-8 rounded-full border-2 mb-1 ${
                                      colorOrder.color === color.name ? 'border-emerald-500' : 'border-gray-400'
                                    }`}
                                    style={{ backgroundColor: color.code }}
                                  />
                                  <span className={`text-xs text-center leading-tight ${
                                    colorOrder.color === color.name ? 'text-emerald-300 font-medium' : 'text-gray-300'
                                  }`}>
                                    {color.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-3">Size Breakdown</label>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          {sizes.map(size => (
                            <div key={size} className="flex items-center space-x-2">
                              <label className="text-sm w-8 font-medium">{size}</label>
                              <input
                                type="number"
                                min="0"
                                max="999"
                                className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                                placeholder="0"
                                value={colorOrder.sizes[size] || ''}
                                onChange={(e) => updateColorOrderSizes(colorOrder.id, size, e.target.value)}
                              />
                              <span className="text-xs text-gray-400 w-12">
                                ${getCurrentPricing(size)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {colorOrder.color ? `${colorOrder.color} Total:` : 'Total Quantity:'}
                            </span>
                            <span className={`font-bold ${colorOrder.quantity > 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                              {colorOrder.quantity} pieces
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addColorOrder}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Color</span>
                  </button>

                  {mainOrder.quantity > 0 && (
                    <div className="bg-slate-800 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">Grand Total:</span>
                        <div className="text-right">
                          <div className="font-bold text-xl text-emerald-400">{mainOrder.quantity} pieces</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-700 rounded-lg overflow-hidden shadow-lg">
              <button
                onClick={() => toggleStep(2)}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-600 hover:bg-slate-500 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">STEP 2</span>
                  <span className="font-semibold">Add-on Items</span>
                  <span className="text-gray-400 text-sm">(Optional)</span>
                </div>
                <ChevronDown className={`w-5 h-5 transform transition-transform ${expandedSteps[2] ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedSteps[2] && (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addOnOptions.map(option => (
                      <button
                        key={option.type}
                        onClick={() => addAddOn(option.type)}
                        className="bg-slate-600 hover:bg-slate-500 rounded-lg p-4 text-center transition-all hover:scale-105"
                      >
                        <div className="w-12 h-12 bg-slate-500 rounded-lg mb-3 mx-auto flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                        <div className="text-sm font-medium mb-1">{option.type}</div>
                        <div className="text-xs text-gray-300 mb-2">{option.description}</div>
                        <div className="text-sm text-emerald-400 font-bold">${option.price.toFixed(2)} per item</div>
                      </button>
                    ))}
                  </div>
                  
                  {addOns.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Selected Add-ons</h3>
                      {addOns.map(addon => (
                        <div key={addon.id} className="bg-slate-600 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-lg">{addon.type}</span>
                            <button
                              onClick={() => removeAddOn(addon.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            {sizes.slice(0, 6).map(size => (
                              <div key={size} className="flex items-center space-x-1">
                                <label className="text-xs w-6">{size}</label>
                                <input
                                  type="number"
                                  min="0"
                                  className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs"
                                  placeholder="0"
                                  value={addon.sizes[size] || ''}
                                  onChange={(e) => updateAddOnSizes(addon.id, size, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Total: <span className="text-emerald-400 font-medium">{addon.quantity} pieces</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-700 rounded-lg overflow-hidden shadow-lg">
              <button
                onClick={() => toggleStep(3)}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-600 hover:bg-slate-500 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">STEP 3</span>
                  <span className="font-semibold">Artwork Options</span>
                  <span className="text-gray-400 text-sm">(Optional)</span>
                </div>
                <ChevronDown className={`w-5 h-5 transform transition-transform ${expandedSteps[3] ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedSteps[3] && (
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Upload Design</label>
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-400 mb-2">Click to upload or drag files here</p>
                      <input 
                        type="file" 
                        onChange={handleFileUpload}
                        accept=".jpg,.jpeg,.png,.gif,.pdf"
                        className="hidden" 
                        id="design-upload"
                      />
                      <label 
                        htmlFor="design-upload"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg cursor-pointer inline-block transition-colors"
                      >
                        Choose File
                      </label>
                      {designDetails.designFileName && (
                        <div className="mt-3 p-2 bg-emerald-100 text-emerald-800 rounded text-sm">
                          {designDetails.designFileName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-700 rounded-lg overflow-hidden shadow-lg">
              <button
                onClick={() => toggleStep(4)}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-600 hover:bg-slate-500 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">STEP 4</span>
                  <span className="font-semibold">Shipping</span>
                  <span className="text-teal-400">*</span>
                </div>
                <ChevronDown className={`w-5 h-5 transform transition-transform ${expandedSteps[4] ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedSteps[4] && (
                <div className="p-6 space-y-6">
                  {errors.shipping && <p className="text-red-400 text-sm">{errors.shipping}</p>}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`border border-slate-600 rounded-lg p-4 cursor-pointer transition-colors ${
                        shippingMethod.selectedDate === '2025-10-02' ? 'ring-2 ring-emerald-500 bg-slate-600' : 'hover:border-orange-500'
                      }`}
                      onClick={() => setShippingMethod({selectedDate: '2025-10-02', selectedMethod: 'expedited'})}
                    >
                      <div className="text-center">
                        <div className="font-medium">Thursday Oct 02</div>
                        <div className="text-orange-400 font-medium mt-2">Expedited</div>
                        <div className="text-sm text-gray-300">(+$2.93 EACH)</div>
                      </div>
                    </div>

                    <div 
                      className={`border border-slate-600 rounded-lg p-4 cursor-pointer transition-colors ${
                        shippingMethod.selectedDate === '2025-10-14' ? 'ring-2 ring-emerald-500 bg-slate-600' : 'hover:border-emerald-500'
                      }`}
                      onClick={() => setShippingMethod({selectedDate: '2025-10-14', selectedMethod: 'standard'})}
                    >
                      <div className="text-center bg-emerald-900 bg-opacity-30 rounded-lg p-3">
                        <div className="font-medium">Tuesday Oct 14</div>
                        <div className="text-emerald-400 font-bold mt-2">FREE</div>
                        <div className="text-sm text-emerald-300">($0.00 EACH)</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-700 rounded-lg overflow-hidden shadow-lg">
              <button
                onClick={() => toggleStep(5)}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-600 hover:bg-slate-500 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">STEP 5</span>
                  <span className="font-semibold">Contact Information</span>
                  <span className="text-teal-400">*</span>
                </div>
                <ChevronDown className={`w-5 h-5 transform transition-transform ${expandedSteps[5] ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedSteps[5] && (
                <div className="p-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    className={`w-full bg-slate-800 border rounded-lg px-4 py-3 ${
                      errors.name ? 'border-red-500' : 'border-slate-600'
                    }`}
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  />
                  {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                  
                  <input
                    type="email"
                    placeholder="Email Address *"
                    className={`w-full bg-slate-800 border rounded-lg px-4 py-3 ${
                      errors.email ? 'border-red-500' : 'border-slate-600'
                    }`}
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  />
                  {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                  
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    className={`w-full bg-slate-800 border rounded-lg px-4 py-3 ${
                      errors.phone ? 'border-red-500' : 'border-slate-600'
                    }`}
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  />
                  {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
                  
                  <input
                    type="text"
                    placeholder="Company Name (Optional)"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3"
                    value={customerInfo.company}
                    onChange={(e) => setCustomerInfo({...customerInfo, company: e.target.value})}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-700 rounded-lg shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Order Summary
              </h3>
              
              <div className="space-y-3 mb-6">
                {mainOrder.quantity > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Main Order ({mainOrder.quantity} items)</span>
                    <span className="text-sm">${calculations.mainTotal.toFixed(2)}</span>
                  </div>
                )}
                
                {addOns.map(addon => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span>{addon.quantity} {addon.type}</span>
                    <span>${(addon.quantity * addon.price).toFixed(2)}</span>
                  </div>
                ))}
                
                {calculations.totalItems > 0 && (
                  <>
                    <hr className="border-slate-600" />
                    <div className="flex justify-between">
                      <span>Subtotal ({calculations.totalItems} items)</span>
                      <span>${calculations.subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Shipping</span>
                      <span className={calculations.shippingCost > 0 ? 'text-orange-400' : 'text-emerald-400 font-medium'}>
                        {calculations.shippingCost > 0 ? `$${calculations.shippingCost.toFixed(2)}` : 'FREE'}
                      </span>
                    </div>
                    
                    <hr className="border-slate-600" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-emerald-400">${calculations.finalTotal.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || calculations.totalItems === 0}
                className={`w-full font-bold py-4 rounded-lg transition-all ${
                  isSubmitting || calculations.totalItems === 0 ? 'bg-slate-600 cursor-not-allowed' :
                  'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white hover:scale-105'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 
                 calculations.totalItems === 0 ? 'Add Items to Continue' : 
                 'Get Free Proof'}
              </button>
              
              <div className="text-center mt-4">
                <p className="text-xs text-gray-400">
                  Free digital proof for approval<br/>
                  Free shipping included<br/>
                  No payment until approved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleBuilder;