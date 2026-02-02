import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, Plus, Trash2, Check, Calendar, Wallet } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Auth from './components/Auth';
import { firestoreStorage } from './utils/firestoreStorage';

// Tutorial overlay component - DEFINED OUTSIDE to prevent recreation on re-render
const TutorialOverlay = ({ 
  showTutorial, 
  tutorialStep, 
  setTutorialStep,
  setShowTutorial,
  setActiveTab,
  tutorialNewAccount,
  setTutorialNewAccount,
  tutorialNewExpense,
  setTutorialNewExpense,
  tutorialNewIncome,
  setTutorialNewIncome,
  accounts,
  recurringExpenses,
  recurringIncome,
  addAccountTutorial,
  addRecurringExpenseTutorial,
  addRecurringIncomeTutorial,
  formatCurrency,
  userId
}) => {
  if (!showTutorial || tutorialStep === 0 || tutorialStep > 5) return null;

  const tutorialSteps = {
    1: {
      title: "Welcome to FlowTrack!",
      description: "Your personal cashflow management tool for tracking every dollar from paycheck to paycheck.",
      tip: "FlowTrack helps you manage your cash accounts and expenses. Track what you pay with cash or debit - not credit card purchases (just the credit card payment itself!).",
      tab: 'accounts',
      nextEnabled: true
    },
    2: {
      title: "Step 1: Add Your Bank Accounts",
      description: "Let's start by adding your cash accounts. Enter the name and current balance for each account.",
      tip: "Add all your accounts that you use for paying bills - checking, savings, etc.",
      tab: 'accounts',
      nextEnabled: accounts.length > 0
    },
    3: {
      title: "Step 2: Add Recurring Expenses",
      description: "Add expenses that repeat regularly - rent, utilities, car payments, etc.",
      tip: "Important: Only add expenses you pay with CASH. Don't include credit card purchases - just the credit card payment itself!",
      tab: 'recurring',
      nextEnabled: recurringExpenses.length > 0
    },
    4: {
      title: "Step 3: Add Expected Income",
      description: "Add your paychecks and other regular income sources.",
      tip: "Set the frequency and start date to automatically project future income! Pro Tip: Enter the amount of your last pay check and select the date for your next paycheck",
      tab: 'recurring',
      nextEnabled: recurringIncome.length > 0
    },
    5: {
      title: "Step 4: You're All Set!",
      description: "Great job! You've set up your accounts, recurring expenses, and income.",
      tip: "Now you're ready to track your cashflow. Here's how to manage your day-to-day expenses:",
      tab: 'expenses',
      nextEnabled: true
    }
  };

  const currentStep = tutorialSteps[tutorialStep];

  const handleNext = () => {
    if (tutorialStep === 5) {
      setShowTutorial(false);
      setTutorialStep(6);
      setActiveTab('welcome');
      if (userId) {
        firestoreStorage.set(userId, 'tutorial-completed', 'true');
      }
    } else {
      setTutorialStep(tutorialStep + 1);
    }
  };

  const handleSkip = () => {
    setShowTutorial(false);
    setTutorialStep(0);
    setActiveTab('welcome');
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9990]"></div>
      
      {/* Tutorial Card */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9991] w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-blue-500/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white sticky top-0 z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                {tutorialStep === 1 ? 'Welcome' : `Step ${tutorialStep - 1} of 4`}
              </span>
              <button onClick={handleSkip} className="text-white/80 hover:text-white text-sm font-medium">
                Skip Tutorial
              </button>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{currentStep.title}</h2>
            <p className="text-blue-100">{currentStep.description}</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-slate-200">{currentStep.tip}</p>
            </div>

            {/* Step 1: Welcome */}
            {tutorialStep === 1 && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
                  <h3 className="text-xl font-bold text-slate-100 mb-4">What is FlowTrack?</h3>
                  <div className="space-y-3 text-slate-300">
                    <p>FlowTrack is your personal cashflow tracker designed to help you manage money from <strong className="text-blue-400">paycheck to paycheck</strong>.</p>
                    <p>Unlike budgeting apps that track every penny, FlowTrack focuses on your <strong className="text-purple-400">cash accounts</strong> and the bills you pay with them.</p>
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-emerald-300 mb-2">What FlowTrack Does:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Track your checking and savings accounts</li>
                        <li>• Monitor bills paid with cash/debit</li>
                        <li>• See your balance after expenses are paid</li>
                        <li>• Project your cashflow into the future</li>
                      </ul>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                      <h4 className="font-semibold text-rose-300 mb-2">What FlowTrack Doesn't Track:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Credit card purchases (track the payment, not the purchases)</li>
                        <li>• Investment accounts or retirement funds</li>
                        <li>• Detailed spending categories</li>
                      </ul>
                    </div>
                    <p className="text-center text-lg font-semibold text-blue-300 pt-4">Let's get you set up in just 4 quick steps!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Add Accounts */}
            {tutorialStep === 2 && (
              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Add an Account</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Account name (e.g., Checking)"
                      value={tutorialNewAccount.name}
                      onChange={(e) => setTutorialNewAccount({ ...tutorialNewAccount, name: e.target.value })}
                      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Current balance"
                      value={tutorialNewAccount.balance}
                      onChange={(e) => setTutorialNewAccount({ ...tutorialNewAccount, balance: e.target.value })}
                      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={tutorialNewAccount.date}
                      onChange={(e) => setTutorialNewAccount({ ...tutorialNewAccount, date: e.target.value })}
                      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={addAccountTutorial}
                    type="button"
                    className="bg-emerald-600/20 text-emerald-100 px-4 py-2 rounded-xl hover:bg-emerald-600/30 transition-all border border-emerald-500/30 font-medium"
                  >
                    + Add Account
                  </button>
                </div>

                {accounts.length > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <h4 className="text-emerald-300 font-semibold mb-3">Your Accounts ({accounts.length})</h4>
                    <div className="space-y-2">
                      {accounts.map(acc => (
                        <div key={acc.id} className="flex justify-between items-center text-slate-200 text-sm bg-slate-800/50 p-2 rounded">
                          <span>{acc.name}</span>
                          <span className="font-semibold text-emerald-400">{formatCurrency(acc.balance)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Add Recurring Expenses */}
            {tutorialStep === 3 && (
              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Add a Recurring Expense</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Expense name (e.g., Rent)"
                      value={tutorialNewExpense.name}
                      onChange={(e) => setTutorialNewExpense({ ...tutorialNewExpense, name: e.target.value })}
                      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={tutorialNewExpense.amount}
                      onChange={(e) => setTutorialNewExpense({ ...tutorialNewExpense, amount: e.target.value })}
                      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={tutorialNewExpense.frequency}
                      onChange={(e) => setTutorialNewExpense({ ...tutorialNewExpense, frequency: e.target.value })}
                      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <input
                      type="date"
                      value={tutorialNewExpense.startDate}
                      onChange={(e) => setTutorialNewExpense({ ...tutorialNewExpense, startDate: e.target.value })}
                      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm mb-3 text-slate-300">
                    <input
                      type="checkbox"
                      checked={tutorialNewExpense.isProjected}
                      onChange={(e) => setTutorialNewExpense({ ...tutorialNewExpense, isProjected: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Projected (estimated amount)</span>
                  </label>
                  <button
                    onClick={addRecurringExpenseTutorial}
                    type="button"
                    className="bg-rose-600/20 text-rose-100 px-4 py-2 rounded-xl hover:bg-rose-600/30 transition-all border border-rose-500/30 font-medium"
                  >
                    + Add Recurring Expense
                  </button>
                </div>

                {recurringExpenses.length > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
                    <h4 className="text-rose-300 font-semibold mb-3">Your Recurring Expenses ({recurringExpenses.length})</h4>
                    <div className="space-y-2">
                      {recurringExpenses.map(exp => (
                        <div key={exp.id} className="flex justify-between items-center text-slate-200 text-sm bg-slate-800/50 p-2 rounded">
                          <div>
                            <span className="font-medium">{exp.name}</span>
                            <span className="text-slate-400 text-xs ml-2">({exp.frequency})</span>
                          </div>
                          <span className="font-semibold text-rose-400">{formatCurrency(exp.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Add Recurring Income */}
            {tutorialStep === 4 && (
              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Add Recurring Income</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Income name (e.g., Salary)"
                      value={tutorialNewIncome.name}
                      onChange={(e) => setTutorialNewIncome({ ...tutorialNewIncome, name: e.target.value })}
                      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={tutorialNewIncome.amount}
                      onChange={(e) => setTutorialNewIncome({ ...tutorialNewIncome, amount: e.target.value })}
                      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={tutorialNewIncome.frequency}
                      onChange={(e) => setTutorialNewIncome({ ...tutorialNewIncome, frequency: e.target.value })}
                      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <input
                      type="date"
                      value={tutorialNewIncome.startDate}
                      onChange={(e) => setTutorialNewIncome({ ...tutorialNewIncome, startDate: e.target.value })}
                      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={tutorialNewIncome.accountId}
                      onChange={(e) => setTutorialNewIncome({ ...tutorialNewIncome, accountId: e.target.value })}
                      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Account</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={addRecurringIncomeTutorial}
                    type="button"
                    className="bg-emerald-600/20 text-emerald-100 px-4 py-2 rounded-xl hover:bg-emerald-600/30 transition-all border border-emerald-500/30 font-medium"
                  >
                    + Add Recurring Income
                  </button>
                </div>

                {recurringIncome.length > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <h4 className="text-emerald-300 font-semibold mb-3">Your Recurring Income ({recurringIncome.length})</h4>
                    <div className="space-y-2">
                      {recurringIncome.map(inc => (
                        <div key={inc.id} className="flex justify-between items-center text-slate-200 text-sm bg-slate-800/50 p-2 rounded">
                          <div>
                            <span className="font-medium">{inc.name}</span>
                            <span className="text-slate-400 text-xs ml-2">({inc.frequency})</span>
                          </div>
                          <span className="font-semibold text-emerald-400">{formatCurrency(inc.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Summary */}
            {tutorialStep === 5 && (
              <div className="space-y-3 bg-slate-800/50 rounded-xl p-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4">
                  <h3 className="text-emerald-300 font-bold text-lg mb-2">Setup Complete!</h3>
                  <div className="text-slate-200 space-y-1">
                    <p>Accounts: {accounts.length}</p>
                    <p>Recurring Expenses: {recurringExpenses.length}</p>
                    <p>Recurring Income: {recurringIncome.length}</p>
                  </div>
                </div>

                <h3 className="font-semibold text-slate-100 text-lg mb-3">Quick Guide: Managing Your Expenses</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg">
                    <span className="text-blue-400 text-xl flex-shrink-0">1</span>
                    <div>
                      <strong className="text-slate-100">Check the Expenses Tab:</strong> See all upcoming expenses (both one-time and recurring).
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg">
                    <span className="text-purple-400 text-xl flex-shrink-0">2</span>
                    <div>
                      <strong className="text-slate-100">Add Payments:</strong> When you pay a bill, click "+ Add Payment" to record which account you paid from.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg">
                    <span className="text-emerald-400 text-xl flex-shrink-0">3</span>
                    <div>
                      <strong className="text-slate-100">Track Your Balance:</strong> The Overview tab shows your current balance and projected balance.
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-rose-400 text-xl flex-shrink-0">!</span>
                    <p className="text-rose-200 text-sm">
                      <strong>Remember:</strong> Only mark expenses as paid AFTER you've actually paid them. FlowTrack tracks your real cashflow!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-900/50 p-6 flex items-center justify-between border-t border-slate-700 sticky bottom-0">
            {tutorialStep > 1 && (
              <button
                onClick={() => setTutorialStep(tutorialStep - 1)}
                className="px-6 py-2 text-slate-300 hover:text-slate-100 font-medium transition-colors"
              >
                ← Back
              </button>
            )}
            <div className="flex-1"></div>
            <button
              onClick={handleNext}
              disabled={!currentStep.nextEnabled}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                currentStep.nextEnabled
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {tutorialStep === 5 ? 'Start Using FlowTrack' : tutorialStep === 1 ? "Let's Get Started" : 'Next Step'}
            </button>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 pb-4">
            {[1, 2, 3, 4, 5].map(step => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === tutorialStep
                    ? 'bg-blue-500 w-8'
                    : step < tutorialStep
                    ? 'bg-emerald-500'
                    : 'bg-slate-600'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};


function CashflowTracker({ userId, user, isGuest, onSignOut }) {
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [recurringIncome, setRecurringIncome] = useState([]);
  
  const [activeTab, setActiveTab] = useState('welcome');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddRecurringExpense, setShowAddRecurringExpense] = useState(false);
  const [showAddRecurringIncome, setShowAddRecurringIncome] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingRecurringExpense, setEditingRecurringExpense] = useState(null);
  const [editingRecurringIncome, setEditingRecurringIncome] = useState(null);
  const [editingIncome, setEditingIncome] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [applyToFuture, setApplyToFuture] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [showAllIncome, setShowAllIncome] = useState(false);
  const [showAllProjections, setShowAllProjections] = useState(false);
  const [planningSubTab, setPlanningSubTab] = useState('calendar');
  const [showPaidExpenses, setShowPaidExpenses] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('3months');
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [expenseSearch, setExpenseSearch] = useState('');
  const [recurringExpenseSearch, setRecurringExpenseSearch] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0); // 0 = not started, 1-4 = steps, 5 = completed
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialNewAccount, setTutorialNewAccount] = useState({ name: '', balance: '', date: new Date().toISOString().split('T')[0] });
  const [tutorialNewExpense, setTutorialNewExpense] = useState({ name: '', amount: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0], isProjected: false });
  const [tutorialNewIncome, setTutorialNewIncome] = useState({ name: '', amount: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0], accountId: '' });
  const [showGuestWarning, setShowGuestWarning] = useState(true);

  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [projectionsDateRange, setprojectionsDateRange] = useState({
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
});

  const [newAccount, setNewAccount] = useState({ name: '', balance: '', date: new Date().toISOString().split('T')[0] });
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', dateDue: '', isProjected: false });
  const [newIncome, setNewIncome] = useState({ name: '', amount: '', dateExpected: '', accountId: '' });
  const [newRecurringExpense, setNewRecurringExpense] = useState({ name: '', amount: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0], isProjected: false });
  const [newRecurringIncome, setNewRecurringIncome] = useState({ name: '', amount: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0], accountId: '' });
  const [newPayment, setNewPayment] = useState({ amount: '', accountId: '', datePaid: new Date().toISOString().split('T')[0] });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Load data on mount
useEffect(() => {
  const loadData = async () => {
    // Guest mode - skip Firebase entirely and load demo data immediately
    if (!userId) {
      setAccounts([
        { id: 1, name: 'Example Checking', balance: 1000, date: '2026-01-29' },
        { id: 2, name: 'Example Savings', balance: 500, date: '2026-01-29' }
      ]);
      setExpenses([
        { id: 1, name: 'Test Expense 1', amount: 100, dateDue: '2026-02-05', payments: [], isProjected: false, recurringId: null, isRecurringInstance: false },
        { id: 2, name: 'Test Expense 2', amount: 75, dateDue: '2026-02-10', payments: [], isProjected: false, recurringId: null, isRecurringInstance: false }
      ]);
      setIncome([
        { id: 1, name: 'Example Income', amount: 500, dateExpected: '2026-02-07', accountId: 1, recurringId: null, isRecurringInstance: false }
      ]);
      setRecurringExpenses([
        { id: 1, name: 'Test Recurring Expense', amount: 50, frequency: 'monthly', startDate: '2026-02-01', isProjected: false, isActive: true }
      ]);
      setRecurringIncome([
        { id: 1, name: 'Test Recurring Income', amount: 250, frequency: 'biweekly', startDate: '2026-02-01', accountId: 1, isActive: true }
      ]);
      
      // GUEST MODE: Always show tutorial
      setActiveTab('accounts');
      setShowTutorial(true);
      setTutorialStep(1);
      
      setIsLoading(false);
      return; // Exit early for guest mode
    }
    
   
    
    // Declare variables outside try block so they're accessible in finally
    let accountsData = null;
    let expensesData = null;
    let incomeData = null;
    let recurringExpData = null;
    let recurringIncData = null;
    
    try {
      accountsData = await firestoreStorage.get(userId, 'cashflow-accounts');
      expensesData = await firestoreStorage.get(userId, 'cashflow-expenses');
      incomeData = await firestoreStorage.get(userId, 'cashflow-income');
      recurringExpData = await firestoreStorage.get(userId, 'cashflow-recurring-expenses');
      recurringIncData = await firestoreStorage.get(userId, 'cashflow-recurring-income');

      if (accountsData?.value) {
        setAccounts(JSON.parse(accountsData.value));
      } else {
        setAccounts([
          { id: 1, name: 'Example Checking', balance: 1000, date: '2026-01-29' },
          { id: 2, name: 'Example Savings', balance: 500, date: '2026-01-29' }
        ]);
      }

      if (expensesData?.value) {
        setExpenses(JSON.parse(expensesData.value));
      } else {
        setExpenses([
          { id: 1, name: 'Test Expense 1', amount: 100, dateDue: '2026-02-05', payments: [], isProjected: false, recurringId: null, isRecurringInstance: false },
          { id: 2, name: 'Test Expense 2', amount: 75, dateDue: '2026-02-10', payments: [], isProjected: false, recurringId: null, isRecurringInstance: false }
        ]);
      }

      if (incomeData?.value) {
        setIncome(JSON.parse(incomeData.value));
      } else {
        setIncome([
          { id: 1, name: 'Example Income', amount: 500, dateExpected: '2026-02-07', accountId: 1, recurringId: null, isRecurringInstance: false }
        ]);
      }

      if (recurringExpData?.value) {
        setRecurringExpenses(JSON.parse(recurringExpData.value));
      } else {
        setRecurringExpenses([
          { id: 1, name: 'Test Recurring Expense', amount: 50, frequency: 'monthly', startDate: '2026-02-01', isProjected: false, isActive: true }
        ]);
      }

      if (recurringIncData?.value) {
        setRecurringIncome(JSON.parse(recurringIncData.value));
      } else {
        setRecurringIncome([
          { id: 1, name: 'Test Recurring Income', amount: 250, frequency: 'biweekly', startDate: '2026-02-01', accountId: 1, isActive: true }
        ]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setAccounts([
        { id: 1, name: 'Example Checking', balance: 1000, date: '2026-01-29' },
        { id: 2, name: 'Example Savings', balance: 500, date: '2026-01-29' }
      ]);
      setExpenses([
        { id: 1, name: 'Test Expense 1', amount: 100, dateDue: '2026-02-05', payments: [], isProjected: false, recurringId: null, isRecurringInstance: false },
        { id: 2, name: 'Test Expense 2', amount: 75, dateDue: '2026-02-10', payments: [], isProjected: false, recurringId: null, isRecurringInstance: false }
      ]);
      setIncome([
        { id: 1, name: 'Example Income', amount: 500, dateExpected: '2026-02-07', accountId: 1, recurringId: null, isRecurringInstance: false }
      ]);
      setRecurringExpenses([
        { id: 1, name: 'Test Recurring Expense', amount: 50, frequency: 'monthly', startDate: '2026-02-01', isProjected: false, isActive: true }
      ]);
      setRecurringIncome([
        { id: 1, name: 'Test Recurring Income', amount: 250, frequency: 'biweekly', startDate: '2026-02-01', accountId: 1, isActive: true }
      ]);
    } finally {
      // Determine if user is new or returning
      const hasCustomData = accountsData?.value || expensesData?.value || incomeData?.value;
      
      // DEBUG: Log what we're seeing
      console.log('🔍 DEBUG - New User Check:');
      console.log('accountsData:', accountsData);
      console.log('expensesData:', expensesData);
      console.log('incomeData:', incomeData);
      console.log('hasCustomData:', hasCustomData);
      
      try {
        const visitedData = await firestoreStorage.get(userId, 'has-visited');
        
        console.log('visitedData:', visitedData);
        console.log('visitedData?.value:', visitedData?.value);
        console.log('Is new user?:', !hasCustomData && visitedData?.value !== 'true');
        
        if (!hasCustomData && visitedData?.value !== 'true') {
          // Brand new user - show tutorial
          console.log('✅ New user detected - starting tutorial');
          setActiveTab('accounts');
          setShowTutorial(true);
          setTutorialStep(1);
        } else {
          // Returning user or has started customizing - show welcome
          console.log('✅ Setting tab to: welcome');
          setActiveTab('welcome');
        }
        
        // Mark as visited after first load
        if (visitedData?.value !== 'true') {
          console.log('📝 Marking user as visited');
          await firestoreStorage.set(userId, 'has-visited', 'true');
        }
      } catch (visitError) {
        console.error('Error checking visit status:', visitError);
        // Default to welcome on error
        setActiveTab('welcome');
      }
      
      setIsLoading(false);
    }
  };
  loadData();
}, [userId]);

  // Save data whenever it changes
useEffect(() => {
  if (!isLoading && accounts.length > 0 && userId) {
    const saveData = async () => {
      try {
        await firestoreStorage.set(userId, 'cashflow-accounts', JSON.stringify(accounts));
        await firestoreStorage.set(userId, 'cashflow-expenses', JSON.stringify(expenses));
        await firestoreStorage.set(userId, 'cashflow-income', JSON.stringify(income));
        await firestoreStorage.set(userId, 'cashflow-recurring-expenses', JSON.stringify(recurringExpenses));
        await firestoreStorage.set(userId, 'cashflow-recurring-income', JSON.stringify(recurringIncome));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    saveData();
  }
}, [accounts, expenses, income, recurringExpenses, recurringIncome, isLoading, userId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getAllExpenseNames = () => {
  const names = new Set();
  expenses.forEach(e => names.add(e.name));
  recurringExpenses.forEach(r => names.add(r.name));
  return Array.from(names).sort();
};

const getAllIncomeNames = () => {
  const names = new Set();
  income.forEach(i => names.add(i.name));
  recurringIncome.forEach(r => names.add(r.name));
  return Array.from(names).sort();
};

// Close all add forms when switching tabs
useEffect(() => {
  setShowAddAccount(false);
  setShowAddExpense(false);
  setShowAddIncome(false);
  setShowAddRecurringExpense(false);
  setShowAddRecurringIncome(false);
}, [activeTab]);

  const generateRecurringInstances = useMemo(() => {
  const instances = { expenses: [], income: [] };
  
  // Generate up to whichever date range is further out + 60 day buffer
  const overviewEnd = new Date(dateRange.endDate);
  const projectionsEnd = new Date(projectionsDateRange.endDate);
  const calendarMonth = new Date(calendarDate);
  calendarMonth.setMonth(calendarMonth.getMonth() + 2); // 2 months ahead for calendar
  const endDate = new Date(Math.max(overviewEnd, projectionsEnd, calendarMonth));
  endDate.setDate(endDate.getDate() + 60); // 60 day buffer
  
  recurringExpenses.filter(r => r.isActive).forEach(recurring => {
    let currentDate = new Date(recurring.startDate);
    
    while (currentDate <= endDate) {
      const instanceDate = currentDate.toISOString().split('T')[0];
      
      const existingInstance = expenses.find(
        e => e.recurringId === recurring.id && e.dateDue === instanceDate
      );
      
      if (!existingInstance) {
        instances.expenses.push({
          id: `recurring-${recurring.id}-${instanceDate}`,
          name: recurring.name,
          amount: recurring.amount,
          dateDue: instanceDate,
          payments: [],
          isProjected: recurring.isProjected,
          recurringId: recurring.id,
          isRecurringInstance: true
        });
      }
      
      switch (recurring.frequency) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'quarterly':
          currentDate.setMonth(currentDate.getMonth() + 3);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        default:
          currentDate = new Date(endDate.getTime() + 1);
      }
    }
  });
    
    recurringIncome.filter(r => r.isActive).forEach(recurring => {
      let currentDate = new Date(recurring.startDate);
      
      while (currentDate <= endDate) {
        const instanceDate = currentDate.toISOString().split('T')[0];
        
        const existingInstance = income.find(
          i => i.recurringId === recurring.id && i.dateExpected === instanceDate
        );
        
        if (!existingInstance) {
          instances.income.push({
            id: `recurring-${recurring.id}-${instanceDate}`,
            name: recurring.name,
            amount: recurring.amount,
            dateExpected: instanceDate,
            accountId: recurring.accountId,
            recurringId: recurring.id,
            isRecurringInstance: true
          });
        }
        
        switch (recurring.frequency) {
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'biweekly':
            currentDate.setDate(currentDate.getDate() + 14);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          case 'quarterly':
            currentDate.setMonth(currentDate.getMonth() + 3);
            break;
          case 'yearly':
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
          default:
            currentDate = new Date(endDate.getTime() + 1);
        }
      }
    });
    
    return instances;
  }, [recurringExpenses, recurringIncome, expenses, income]);

  const allExpenses = useMemo(() => {
    return [...expenses, ...generateRecurringInstances.expenses];
  }, [expenses, generateRecurringInstances]);

  const allIncome = useMemo(() => {
    return [...income, ...generateRecurringInstances.income];
  }, [income, generateRecurringInstances]);

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(exp => {
      const dueDate = new Date(exp.dateDue);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return dueDate >= start && dueDate <= end;
    });
  }, [allExpenses, dateRange]);

  const filteredIncome = useMemo(() => {
    return allIncome.filter(inc => {
      const expectedDate = new Date(inc.dateExpected);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return expectedDate >= start && expectedDate <= end;
    });
  }, [allIncome, dateRange]);

const projectionsFilteredExpenses = useMemo(() => {
  return allExpenses.filter(exp => {
    const dueDate = new Date(exp.dateDue);
    const start = new Date(projectionsDateRange.startDate);
    const end = new Date(projectionsDateRange.endDate);
    return dueDate >= start && dueDate <= end;
  });
}, [allExpenses, projectionsDateRange]);

const projectionsFilteredIncome = useMemo(() => {
  return allIncome.filter(inc => {
    const expectedDate = new Date(inc.dateExpected);
    const start = new Date(projectionsDateRange.startDate);
    const end = new Date(projectionsDateRange.endDate);
    return expectedDate >= start && expectedDate <= end;
  });
}, [allIncome, projectionsDateRange]);

  const projectionsTimeline = useMemo(() => {
    const events = [];
    
    const currentBalance = accounts.reduce((sum, acc) => {
      let balance = acc.balance;
      allExpenses.forEach(exp => {
        exp.payments.forEach(payment => {
          if (payment.accountId === acc.id) {
            balance -= payment.amount;
          }
        });
      });
      return sum + balance;
    }, 0);
    
    projectionsFilteredExpenses.filter(e => {
      const totalPaid = e.payments.reduce((sum, p) => sum + p.amount, 0);
      return totalPaid < e.amount;
    }).forEach(exp => {
      const totalPaid = exp.payments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = exp.amount - totalPaid;
      events.push({ date: exp.dateDue, type: 'expense', amount: -remaining, name: exp.name, id: exp.id });
    });
    
    projectionsFilteredIncome.forEach(inc => {
      events.push({ date: inc.dateExpected, type: 'income', amount: inc.amount, name: inc.name, accountId: inc.accountId });
    });
    
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const timeline = [];
    let totalBalance = currentBalance;
    
    events.forEach(event => {
      totalBalance += event.amount;
      timeline.push({ ...event, totalBalance });
    });
    
    return { timeline, projectedEndBalance: totalBalance, currentBalance };
  }, [accounts, projectionsFilteredExpenses, projectionsFilteredIncome, allExpenses]);

  const addAccount = () => {
  if (newAccount.name && newAccount.balance) {
    setAccounts([...accounts, {
      id: Date.now(),
      name: newAccount.name,
      balance: parseFloat(newAccount.balance),
      date: newAccount.date
    }]);
    setNewAccount({ name: '', balance: '', date: new Date().toISOString().split('T')[0] });
    setShowAddAccount(false);
  }
};

// Tutorial-specific add functions
const addAccountTutorial = () => {
  if (tutorialNewAccount.name && tutorialNewAccount.balance) {
    setAccounts([...accounts, {
      id: Date.now(),
      name: tutorialNewAccount.name,
      balance: parseFloat(tutorialNewAccount.balance),
      date: tutorialNewAccount.date
    }]);
    setTutorialNewAccount({ name: '', balance: '', date: new Date().toISOString().split('T')[0] });
  }
};

const addRecurringExpenseTutorial = () => {
  if (tutorialNewExpense.name && tutorialNewExpense.amount && tutorialNewExpense.startDate) {
    setRecurringExpenses([...recurringExpenses, {
      id: Date.now(),
      name: tutorialNewExpense.name,
      amount: parseFloat(tutorialNewExpense.amount),
      frequency: tutorialNewExpense.frequency,
      startDate: tutorialNewExpense.startDate,
      isProjected: tutorialNewExpense.isProjected,
      isActive: true
    }]);
    setTutorialNewExpense({ name: '', amount: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0], isProjected: false });
  }
};

const addRecurringIncomeTutorial = () => {
  if (tutorialNewIncome.name && tutorialNewIncome.amount && tutorialNewIncome.startDate && tutorialNewIncome.accountId) {
    setRecurringIncome([...recurringIncome, {
      id: Date.now(),
      name: tutorialNewIncome.name,
      amount: parseFloat(tutorialNewIncome.amount),
      frequency: tutorialNewIncome.frequency,
      startDate: tutorialNewIncome.startDate,
      accountId: parseInt(tutorialNewIncome.accountId),
      isActive: true
    }]);
    setTutorialNewIncome({ name: '', amount: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0], accountId: '' });
  }
};

  const addExpense = () => {
    if (newExpense.name && newExpense.amount && newExpense.dateDue) {
      setExpenses([...expenses, {
        id: Date.now(),
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        dateDue: newExpense.dateDue,
        payments: [],
        isProjected: newExpense.isProjected,
        recurringId: null,
        isRecurringInstance: false
      }]);
      setNewExpense({ name: '', amount: '', dateDue: '', isProjected: false });
      setShowAddExpense(false);
    }
  };

  const addIncome = () => {
    if (newIncome.name && newIncome.amount && newIncome.dateExpected && newIncome.accountId) {
      setIncome([...income, {
        id: Date.now(),
        name: newIncome.name,
        amount: parseFloat(newIncome.amount),
        dateExpected: newIncome.dateExpected,
        accountId: parseInt(newIncome.accountId),
        recurringId: null,
        isRecurringInstance: false
      }]);
      setNewIncome({ name: '', amount: '', dateExpected: '', accountId: '' });
      setShowAddIncome(false);
    }
  };

  const addRecurringExpense = () => {
    if (newRecurringExpense.name && newRecurringExpense.amount && newRecurringExpense.startDate) {
      setRecurringExpenses([...recurringExpenses, {
        id: Date.now(),
        name: newRecurringExpense.name,
        amount: parseFloat(newRecurringExpense.amount),
        frequency: newRecurringExpense.frequency,
        startDate: newRecurringExpense.startDate,
        isProjected: newRecurringExpense.isProjected,
        isActive: true
      }]);
      setNewRecurringExpense({ name: '', amount: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0], isProjected: false });
      setShowAddRecurringExpense(false);
    }
  };

  const addRecurringIncome = () => {
    if (newRecurringIncome.name && newRecurringIncome.amount && newRecurringIncome.startDate && newRecurringIncome.accountId) {
      setRecurringIncome([...recurringIncome, {
        id: Date.now(),
        name: newRecurringIncome.name,
        amount: parseFloat(newRecurringIncome.amount),
        frequency: newRecurringIncome.frequency,
        startDate: newRecurringIncome.startDate,
        accountId: parseInt(newRecurringIncome.accountId),
        isActive: true
      }]);
      setNewRecurringIncome({ name: '', amount: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0], accountId: '' });
      setShowAddRecurringIncome(false);
    }
  };

  const addPaymentToExpense = (expenseId) => {
    if (newPayment.amount && newPayment.accountId) {
      const expense = allExpenses.find(e => e.id === expenseId);
      if (expense && expense.isRecurringInstance) {
        const newExp = {
          ...expense,
          id: Date.now(),
          isRecurringInstance: false,
          payments: [{
            id: Date.now(),
            amount: parseFloat(newPayment.amount),
            accountId: parseInt(newPayment.accountId),
            datePaid: newPayment.datePaid
          }]
        };
        setExpenses([...expenses, newExp]);
      } else {
        setExpenses(expenses.map(exp => 
          exp.id === expenseId 
            ? { 
                ...exp, 
                payments: [...exp.payments, {
                  id: Date.now(),
                  amount: parseFloat(newPayment.amount),
                  accountId: parseInt(newPayment.accountId),
                  datePaid: newPayment.datePaid
                }]
              }
            : exp
        ));
      }
      setNewPayment({ amount: '', accountId: '', datePaid: new Date().toISOString().split('T')[0] });
      setShowPaymentModal(null);
    }
  };

  const deletePayment = (expenseId, paymentId) => {
    setExpenses(expenses.map(exp => 
      exp.id === expenseId 
        ? { ...exp, payments: exp.payments.filter(p => p.id !== paymentId) }
        : exp
    ));
  };

  const updateExpense = (id, field, value) => {
    const expense = allExpenses.find(e => e.id === id);
    const updateIncome = (id, field, value) => {
  const incomeItem = allIncome.find(i => i.id === id);
  
  if (incomeItem && incomeItem.isRecurringInstance) {
    const newInc = {
      ...incomeItem,
      id: Date.now(),
      isRecurringInstance: false,
      [field]: field === 'amount' ? parseFloat(value) : field === 'accountId' ? parseInt(value) : value
    };
    setIncome([...income, newInc]);
  } else {
    setIncome(income.map(inc => 
      inc.id === id ? { 
        ...inc, 
        [field]: field === 'amount' ? parseFloat(value) : field === 'accountId' ? parseInt(value) : value 
      } : inc
    ));
  }
  
  if (applyToFuture && incomeItem && incomeItem.recurringId) {
    setRecurringIncome(recurringIncome.map(rec =>
      rec.id === incomeItem.recurringId ? { 
        ...rec, 
        [field]: field === 'amount' ? parseFloat(value) : field === 'accountId' ? parseInt(value) : value 
      } : rec
    ));
  }
};
    if (expense && expense.isRecurringInstance) {
      const newExp = {
        ...expense,
        id: Date.now(),
        isRecurringInstance: false,
        [field]: field === 'amount' ? parseFloat(value) : value
      };
      setExpenses([...expenses, newExp]);
    } else {
      setExpenses(expenses.map(exp => 
        exp.id === id ? { ...exp, [field]: field === 'amount' ? parseFloat(value) : value } : exp
      ));
    }
    
    if (applyToFuture && expense && expense.recurringId) {
      setRecurringExpenses(recurringExpenses.map(rec =>
        rec.id === expense.recurringId ? { ...rec, [field]: field === 'amount' ? parseFloat(value) : value } : rec
      ));
    }
  };

  const actualizeExpense = (id) => {
    const expense = allExpenses.find(e => e.id === id);
    
    if (expense && expense.isRecurringInstance) {
      const newExp = { ...expense, id: Date.now(), isRecurringInstance: false, isProjected: false };
      setExpenses([...expenses, newExp]);
    } else {
      setExpenses(expenses.map(exp => 
        exp.id === id ? { ...exp, isProjected: false } : exp
      ));
    }
    
    if (applyToFuture && expense && expense.recurringId) {
      setRecurringExpenses(recurringExpenses.map(rec =>
        rec.id === expense.recurringId ? { ...rec, isProjected: false } : rec
      ));
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Loading your cashflow data...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-visible border border-slate-700/50">
          
         {/* Tutorial Overlay */}
<TutorialOverlay 
  showTutorial={showTutorial}
  tutorialStep={tutorialStep}
  setTutorialStep={setTutorialStep}
  setShowTutorial={setShowTutorial}
  setActiveTab={setActiveTab}
  tutorialNewAccount={tutorialNewAccount}
  setTutorialNewAccount={setTutorialNewAccount}
  tutorialNewExpense={tutorialNewExpense}
  setTutorialNewExpense={setTutorialNewExpense}
  tutorialNewIncome={tutorialNewIncome}
  setTutorialNewIncome={setTutorialNewIncome}
  accounts={accounts}
  recurringExpenses={recurringExpenses}
  recurringIncome={recurringIncome}
  addAccountTutorial={addAccountTutorial}
  addRecurringExpenseTutorial={addRecurringExpenseTutorial}
  addRecurringIncomeTutorial={addRecurringIncomeTutorial}
  formatCurrency={formatCurrency}
  userId={userId}
/>
          
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-4 md:p-8 relative overflow-hidden border-b border-blue-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent)]"></div>
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-4xl font-black flex items-center gap-2 md:gap-3 mb-1 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                    FlowTrack
                  </h1>
                  <p className="text-blue-300 text-xs md:text-sm font-medium tracking-wide">Master every dollar, from paycheck to paycheck</p>
                  {lastSaved && (
                    <p className="text-blue-400/60 text-xs mt-1">
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
             {/* Profile Dropdown */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all border-2 border-blue-400/30"
                >
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </button>
              </div>
            </div>
          </div>

          {/* Dropdown Menu - Outside overflow container */}
          {showProfileDropdown && (
            <>
              {/* Backdrop to close dropdown */}
              <div 
                className="fixed inset-0 z-[9998]"
                onClick={() => setShowProfileDropdown(false)}
              ></div>
              
              {/* Dropdown Menu */}
              <div className="fixed top-20 right-8 w-64 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-[9999]">
                <div className="p-4 border-b border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
                  <p className="text-xs text-slate-400 mb-1">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-100 truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
  onClick={() => {
    setShowProfileDropdown(false);
    onSignOut();
  }}
  className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-300 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-all group"
>
  <svg className="w-5 h-5 group-hover:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
  <span className="font-medium">{isGuest ? 'Exit Guest Mode' : 'Sign Out'}</span>
</button>
                </div>
              </div>
            </>
          )}

          <div className="flex border-b border-slate-700/50 bg-slate-900/50 overflow-x-auto sticky top-0 z-20 backdrop-blur-sm">
  {['welcome', 'overview', 'accounts', 'expenses', 'income', 'recurring','planning'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 font-semibold capitalize transition-all whitespace-nowrap relative ${
                  activeTab === tab
                    ? 'text-blue-400 bg-slate-800/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 shadow-lg shadow-blue-500/50"></div>
                )}
              </button>
            ))}
          </div>

{activeTab === 'welcome' && (
  <div className="max-w-4xl mx-auto space-y-8 pt-6 md:pt-8">
    {/* Welcome Header */}
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-blue-500/20 text-center">
      <h2 className="text-4xl font-bold text-slate-100 mb-3">
        Welcome! 💰
      </h2>
      <p className="text-xl text-blue-300 mb-2">Happy Payday!</p>
      <p className="text-slate-300 text-lg">
        Let's manage your cashflow together. Follow these steps to stay on top of your finances.
      </p>
    </div>

    {/* Introduction */}
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
      <p className="text-slate-300 text-lg leading-relaxed">
        Whether you're new here or a returning user, FlowTrack is designed to be used <strong className="text-blue-400">once per paycheck</strong>. 
        Take 15 minutes today to update everything, pay your bills, and you'll have complete visibility into your finances until your next payday.
      </p>
    </div>

    {/* Step-by-step Guide */}
    <div className="space-y-6">
      {/* Step 1 */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-all">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
            <span className="text-2xl font-bold text-blue-300">1</span>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-slate-100 mb-3">Enter Your Current Bank Balances</h3>
            <p className="text-slate-300 mb-4 text-lg">
              Head to the <strong className="text-blue-400">Accounts</strong> tab and update each account with your real, current balances. 
              Make sure these reflect what's in your accounts <strong>right now</strong> — no pending expenses included.
            </p>
            <button
              onClick={() => setActiveTab('accounts')}
              className="bg-blue-600/20 text-blue-100 px-6 py-3 rounded-xl hover:bg-blue-600/30 transition-all border border-blue-500/30 font-semibold"
            >
              Go to Accounts →
            </button>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
            <span className="text-2xl font-bold text-purple-300">2</span>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-slate-100 mb-3">Review Your Expenses</h3>
            <p className="text-slate-300 mb-4 text-lg">
              Check the <strong className="text-purple-400">Expenses</strong> tab to review all upcoming bills and expenses.
            </p>
            <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20 mb-4">
              <p className="text-slate-300 mb-2"><strong className="text-purple-300">Quick check:</strong></p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Verify</strong> all due dates are correct</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Add</strong> any new expenses you know are coming up</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Update</strong> amounts if anything has changed</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setActiveTab('expenses')}
              className="bg-purple-600/20 text-purple-100 px-6 py-3 rounded-xl hover:bg-purple-600/30 transition-all border border-purple-500/30 font-semibold"
            >
              Go to Expenses →
            </button>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-all">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <span className="text-2xl font-bold text-emerald-300">3</span>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-slate-100 mb-3">Pay Your Bills (Rip the Band-Aid Off!)</h3>
            <p className="text-slate-300 mb-4 text-lg">
              The best time to pay bills is <strong className="text-emerald-400">right now on payday</strong> — pay anything due between now and your next paycheck.
            </p>
            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 mb-4">
              <p className="text-slate-300 mb-3"><strong className="text-emerald-300">Workflow:</strong></p>
              <ol className="space-y-2 text-slate-300 list-decimal list-inside">
                <li>Go to your bank/biller website and pay the bill</li>
                <li>Come back to FlowTrack's <strong>Expenses</strong> tab</li>
                <li>Click <strong>"+ Add Payment"</strong> on that expense</li>
                <li>Record the amount, which account you paid from, and the date</li>
                <li>Repeat for all upcoming bills!</li>
              </ol>
            </div>
            <button
              onClick={() => setActiveTab('expenses')}
              className="bg-emerald-600/20 text-emerald-100 px-6 py-3 rounded-xl hover:bg-emerald-600/30 transition-all border border-emerald-500/30 font-semibold"
            >
              Track Payments →
            </button>
          </div>
        </div>
      </div>

      {/* Step 4 */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-amber-500/30 transition-all">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
            <span className="text-2xl font-bold text-amber-300">4</span>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-slate-100 mb-3">Monitor Your Overview</h3>
            <p className="text-slate-300 mb-4 text-lg">
              As you pay bills, keep the <strong className="text-amber-400">Overview</strong> tab open to watch your balances in real-time.
            </p>
            <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 mb-4">
              <p className="text-slate-300 mb-2">The Overview shows you:</p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span><strong>Current Rolling Balance</strong> for each account after payments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>How much you have <strong>left to spend</strong> across all accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>Perfect for managing <strong>multiple accounts</strong> (personal, shared, etc.)</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setActiveTab('overview')}
              className="bg-amber-600/20 text-amber-100 px-6 py-3 rounded-xl hover:bg-amber-600/30 transition-all border border-amber-500/30 font-semibold"
            >
              View Overview →
            </button>
          </div>
        </div>
      </div>

      {/* Step 5 - Completion */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-sm p-8 rounded-2xl border border-emerald-500/20">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-slate-100 mb-4">🎉 You're All Set!</h3>
          <p className="text-slate-300 text-lg mb-6">
            Great job! You've updated everything and paid your bills. <strong className="text-emerald-400">See you on your next payday!</strong>
          </p>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
            <p className="text-slate-300 mb-4 text-lg"><strong className="text-blue-400">Between paydays?</strong> Check out the Planning tab:</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => { setActiveTab('planning'); setPlanningSubTab('calendar'); }}
                className="bg-blue-600/20 text-blue-100 px-6 py-3 rounded-xl hover:bg-blue-600/30 transition-all border border-blue-500/30 font-semibold"
              >
                📅 View Calendar
              </button>
              <button
                onClick={() => { setActiveTab('planning'); setPlanningSubTab('projections'); }}
                className="bg-purple-600/20 text-purple-100 px-6 py-3 rounded-xl hover:bg-purple-600/30 transition-all border border-purple-500/30 font-semibold"
              >
                📊 Check Projections
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

          <div className="p-8 bg-slate-900/50 min-h-screen">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="bg-slate-800/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                  <h3 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wide">Period Filter</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Start Date</label>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">End Date</label>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
  <div className="bg-blue-600/20 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 border border-blue-500/30">
  <p className="text-xs text-blue-300 font-bold uppercase tracking-wide">Future Income in Period</p>
  <p className="text-2xl md:text-3xl font-bold text-blue-100 mt-2">
    {formatCurrency(
      filteredIncome
        .filter(i => new Date(i.dateExpected) > new Date())
        .reduce((sum, i) => sum + i.amount, 0)
    )}
  </p>
</div>

  <div className="bg-emerald-600/20 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 border border-emerald-500/30">
    <p className="text-xs text-emerald-300 font-bold uppercase tracking-wide">Paid Expenses</p>
    <p className="text-2xl md:text-3xl font-bold text-emerald-100 mt-2">
      {formatCurrency(filteredExpenses.reduce((sum, e) => sum + e.payments.reduce((s, p) => s + p.amount, 0), 0))}
    </p>
  </div>

  <div className="bg-amber-600/20 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30 border border-amber-500/30">
    <p className="text-xs text-amber-300 font-bold uppercase tracking-wide">Unpaid Expenses</p>
    <p className="text-2xl md:text-3xl font-bold text-amber-100 mt-2">
      {formatCurrency(filteredExpenses.reduce((sum, e) => {
        const totalPaid = e.payments.reduce((s, p) => s + p.amount, 0);
        return sum + (e.amount - totalPaid);
      }, 0))}
    </p>
  </div>

  <div className="bg-rose-600/20 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-rose-500/30 border border-rose-500/30">
    <p className="text-xs text-rose-300 font-bold uppercase tracking-wide">Total Expenses</p>
    <p className="text-2xl md:text-3xl font-bold text-rose-100 mt-2">
      {formatCurrency(filteredExpenses.reduce((sum, e) => sum + e.amount, 0))}
    </p>
  </div>
</div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
  <h3 className="text-lg font-semibold text-green-900 mb-4">Starting Balance</h3>
  <p className="text-xs text-green-700 mb-4">Initial account balances</p>
  <div className="space-y-3">
    {accounts.map(acc => (
      <div key={acc.id} className="flex justify-between items-center pb-2 border-b border-green-200 last:border-0">
        <div>
          <div className="text-sm font-medium text-green-800">{acc.name}</div>
          <div className="text-xs text-green-600">As of {formatDate(acc.date)}</div>
        </div>
        <span className="text-sm font-bold text-green-900">{formatCurrency(acc.balance)}</span>
      </div>
    ))}
                      <div className="flex justify-between items-center pt-2 border-t-2 border-green-300">
                        <span className="text-base font-bold text-green-900">Total Starting</span>
                        <span className="text-2xl font-bold text-green-900">
                          {formatCurrency(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Current Rolling Balance</h3>
                    <p className="text-xs text-green-700 mb-4">After all paid expenses</p>
                    <div className="space-y-3">
                      {accounts.map(acc => {
                        let balance = acc.balance;
                        allExpenses.forEach(exp => {
                          exp.payments.forEach(payment => {
                            if (payment.accountId === acc.id) {
                              balance -= payment.amount;
                            }
                          });
                        });
                        return (
                          <div key={acc.id} className="flex justify-between items-center pb-2 border-b border-green-200 last:border-0">
                            <span className="text-sm font-medium text-green-800">{acc.name}</span>
                            <span className="text-sm font-bold text-green-900">{formatCurrency(balance)}</span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between items-center pt-2 border-t-2 border-green-300">
                        <span className="text-base font-bold text-green-900">Total Current</span>
                        <span className="text-2xl font-bold text-green-900">
                          {formatCurrency(projectionsTimeline.currentBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
  <h3 className="text-lg font-semibold text-green-900 mb-3">Projected Balance Within Period</h3>
  <p className="text-sm text-green-700 mb-4">Current balance + expected income - unpaid expenses</p>
  <div className="flex items-center justify-between">
    <div className="text-sm text-green-800 space-y-1">
      <div>
        <span className="font-medium">Current Rolling Balance:</span> {formatCurrency(projectionsTimeline.currentBalance)}
      </div>
      <div>
        <span className="font-medium">Expected Income:</span> <span className="text-green-700">+{formatCurrency(
          filteredIncome
            .filter(i => new Date(i.dateExpected) > new Date())
            .reduce((sum, i) => sum + i.amount, 0)
        )}</span>
      </div>
      <div>
        <span className="font-medium">Unpaid Expenses:</span> <span className="text-red-700">-{formatCurrency(filteredExpenses.reduce((sum, e) => {
          const totalPaid = e.payments.reduce((s, p) => s + p.amount, 0);
          return sum + (e.amount - totalPaid);
        }, 0))}</span>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xs text-green-700 mb-1 uppercase tracking-wide font-semibold">Projected Balance</p>
      <p className="text-3xl font-bold text-green-900">
        {formatCurrency(
          projectionsTimeline.currentBalance + 
          filteredIncome
            .filter(i => new Date(i.dateExpected) > new Date())
            .reduce((sum, i) => sum + i.amount, 0) -
          filteredExpenses.reduce((sum, e) => {
            const totalPaid = e.payments.reduce((s, p) => s + p.amount, 0);
            return sum + (e.amount - totalPaid);
          }, 0)
        )}
      </p>
    </div>
  </div>
</div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-100 flex items-center gap-2">
                      <div className="w-1 h-5 bg-rose-500 rounded-full"></div>
                      Expenses in Period ({formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredExpenses.length === 0 ? (
                        <p className="text-slate-400 text-sm p-3 bg-slate-800/30 rounded-lg">No expenses in this period</p>
                      ) : (
                        [...filteredExpenses]
                          .sort((a, b) => new Date(a.dateDue) - new Date(b.dateDue))
                          .slice(0, showAllExpenses ? filteredExpenses.length : 15)
                          .map(exp => {
                          const totalPaid = exp.payments.reduce((sum, p) => sum + p.amount, 0);
                          const remaining = exp.amount - totalPaid;
                          return (
                            <div key={exp.id} className="p-3 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-all">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-slate-200">{exp.name}</span>
                                  {exp.isProjected && (
                                    <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30">PROJ</span>
                                  )}
                                  {exp.isRecurringInstance && (
                                    <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">REC</span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className={`font-semibold ${remaining > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {formatCurrency(exp.amount)}
                                  </div>
                                  <div className="text-xs text-slate-400">{formatDate(exp.dateDue)}</div>
                                  {totalPaid > 0 && (
                                    <div className="text-xs text-emerald-400">Paid: {formatCurrency(totalPaid)}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                         })
                      )}
                      {filteredExpenses.length > 15 && (
                        <button
                          onClick={() => setShowAllExpenses(!showAllExpenses)}
                          className="w-full mt-3 py-2 text-sm text-blue-400 hover:text-blue-300 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-all"
                        >
                          {showAllExpenses ? `Show Less (${filteredExpenses.length} total)` : `Show All (${filteredExpenses.length - 15} more)`}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
  <h3 className="text-lg font-semibold mb-4 text-slate-100 flex items-center gap-2">
    <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
    Income in Period ({formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)})
  </h3>
  <div className="space-y-2 max-h-96 overflow-y-auto">
    {filteredIncome.length === 0 ? (
      <p className="text-slate-400 text-sm p-3 bg-slate-800/30 rounded-lg">No income in this period</p>
    ) : (
      [...filteredIncome]
        .sort((a, b) => new Date(a.dateExpected) - new Date(b.dateExpected))
        .slice(0, showAllIncome ? filteredIncome.length : 15)
        .map(inc => {
          const isPast = new Date(inc.dateExpected) <= new Date();
          return (
            <div key={inc.id} className={`p-3 backdrop-blur-sm rounded-lg border transition-all ${
              isPast 
                ? 'bg-slate-700/30 border-slate-600/50 opacity-60' 
                : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isPast ? 'text-slate-400' : 'text-slate-200'}`}>{inc.name}</span>
                    {inc.isRecurringInstance && (
                      <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">REC</span>
                    )}
                    {isPast && (
                      <span className="ml-2 text-xs bg-slate-600/30 text-slate-400 px-2 py-0.5 rounded border border-slate-600/30">PAST - Update account balance</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">To: {accounts.find(a => a.id === inc.accountId)?.name}</div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${isPast ? 'text-slate-500' : 'text-blue-400'}`}>{formatCurrency(inc.amount)}</div>
                  <div className="text-xs text-slate-400">{formatDate(inc.dateExpected)}</div>
                </div>
              </div>
            </div>
          );
        })
    )}
    {filteredIncome.length > 15 && (
      <button
        onClick={() => setShowAllIncome(!showAllIncome)}
        className="w-full mt-3 py-2 text-sm text-blue-400 hover:text-blue-300 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-all"
      >
        {showAllIncome ? `Show Less (${filteredIncome.length} total)` : `Show All (${filteredIncome.length - 15} more)`}
      </button>
    )}
  </div>
</div>
                </div>
              </div>
            )}

      

            {activeTab === 'accounts' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <h2 className="text-2xl font-semibold text-slate-100">Cash Accounts</h2>
                  <button
                    onClick={() => setShowAddAccount(!showAddAccount)}
                    className="flex items-center gap-1.5 bg-blue-600/20 backdrop-blur-sm text-blue-100 px-3 py-2 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-500/30 text-sm font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add Account</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>

                {showAddAccount && (
                  <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl mb-4 border border-slate-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Account name"
                        value={newAccount.name}
                        onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                        className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Balance"
                        value={newAccount.balance}
                        onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                        className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="date"
                        value={newAccount.date}
                        onChange={(e) => setNewAccount({ ...newAccount, date: e.target.value })}
                        className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={addAccount}
                      className="mt-3 bg-emerald-600/20 backdrop-blur-sm text-emerald-100 px-4 py-2 rounded-xl hover:bg-emerald-600/30 transition-all border border-emerald-500/30"
                    >
                      Save Account
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {accounts.map(acc => (
                    <div key={acc.id} className="flex justify-between items-center p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all hover:border-slate-600/50">
                      {editingAccount === acc.id ? (
                        <div className="flex-1 grid grid-cols-3 gap-3 mr-4">
                          <input
                            type="text"
                            value={acc.name}
                            onChange={(e) => setAccounts(accounts.map(a => a.id === acc.id ? { ...a, name: e.target.value } : a))}
                            className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200"
                          />
                          <input
                            type="number"
                            value={acc.balance}
                            onChange={(e) => setAccounts(accounts.map(a => a.id === acc.id ? { ...a, balance: parseFloat(e.target.value) } : a))}
                            className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200"
                          />
                          <input
                            type="date"
                            value={acc.date}
                            onChange={(e) => setAccounts(accounts.map(a => a.id === acc.id ? { ...a, date: e.target.value } : a))}
                            className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200"
                          />
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-slate-100">{acc.name}</h3>
                          <p className="text-sm text-slate-400">As of {formatDate(acc.date)}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        {editingAccount === acc.id ? (
                          <button
                            onClick={() => setEditingAccount(null)}
                            className="bg-emerald-600/20 text-emerald-100 px-4 py-2 rounded-xl hover:bg-emerald-600/30 transition-all text-sm border border-emerald-500/30"
                          >
                            Done
                          </button>
                        ) : (
                          <>
                            <span className="text-xl font-bold text-emerald-400">{formatCurrency(acc.balance)}</span>
                            <button
                              onClick={() => setEditingAccount(acc.id)}
                              className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                            >
                              Edit
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setAccounts(accounts.filter(a => a.id !== acc.id))}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'expenses' && (
  <div>
    <div className="space-y-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-semibold text-slate-100">Expenses</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPaidExpenses(!showPaidExpenses)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all border text-sm font-medium ${
              showPaidExpenses 
                ? 'bg-emerald-600/20 text-emerald-100 border-emerald-500/30 hover:bg-emerald-600/30'
                : 'bg-slate-700/20 text-slate-300 border-slate-600/30 hover:bg-slate-700/30'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showPaidExpenses ? 'Hide Paid' : 'Show Paid (30d)'}</span>
            <span className="sm:hidden">{showPaidExpenses ? 'Hide' : 'Paid'}</span>
          </button>
          <button
            onClick={() => setShowAddExpense(!showAddExpense)}
            className="flex items-center gap-1.5 bg-blue-600/20 backdrop-blur-sm text-blue-100 px-3 py-2 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-500/30 text-sm font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search expenses..."
          value={expenseSearch}
          onChange={(e) => setExpenseSearch(e.target.value)}
          className="w-full px-4 py-3 pl-10 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    {showAddExpense && (
      <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Expense name"
              value={newExpense.name}
              onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
              list="expense-names"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            <datalist id="expense-names">
              {getAllExpenseNames().map(name => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <input
            type="number"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
          />
          <input
            type="date"
            value={newExpense.dateDue}
            onChange={(e) => setNewExpense({ ...newExpense, dateDue: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newExpense.isProjected}
              onChange={(e) => setNewExpense({ ...newExpense, isProjected: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-gray-700">Projected Expense (estimate)</span>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addExpense}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Save Expense
          </button>
          <button
            onClick={() => {
              setShowAddExpense(false);
              setNewExpense({ name: '', amount: '', dateDue: '', isProjected: false });
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    <div className="space-y-3">
      {(() => {
        // Get all actual expenses (non-recurring instances from expenses state)
        const actualExpenses = expenses;
        
        // For each active recurring rule, get only the NEXT upcoming instance
        const nextRecurringInstances = recurringExpenses
          .filter(r => r.isActive)
          .map(recurring => {
            // Find instances for this recurring rule that are in the future
            const futureInstances = generateRecurringInstances.expenses
              .filter(inst => 
                inst.recurringId === recurring.id && 
                new Date(inst.dateDue) >= new Date()
              )
              .sort((a, b) => new Date(a.dateDue) - new Date(b.dateDue));
            
            return futureInstances[0]; // Return only the first/next one
          })
          .filter(Boolean); // Remove any undefined
        
        // Combine all expenses
        let displayExpenses = [...actualExpenses, ...nextRecurringInstances];

        // Filter by search query
        if (expenseSearch) {
          displayExpenses = displayExpenses.filter(exp => 
            exp.name.toLowerCase().includes(expenseSearch.toLowerCase())
          );
        }

        // Filter based on paid status
        if (!showPaidExpenses) {
          // Show only unpaid expenses
          displayExpenses = displayExpenses.filter(exp => {
            const totalPaid = exp.payments.reduce((sum, p) => sum + p.amount, 0);
            return totalPaid < exp.amount; // Has unpaid balance
          });
        } else {
          // Show unpaid + paid expenses from last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          displayExpenses = displayExpenses.filter(exp => {
            const totalPaid = exp.payments.reduce((sum, p) => sum + p.amount, 0);
            const isUnpaid = totalPaid < exp.amount;
            
            if (isUnpaid) return true; // Always show unpaid
            
            // For paid expenses, check if paid in last 30 days
            const mostRecentPayment = exp.payments.length > 0 
              ? new Date(Math.max(...exp.payments.map(p => new Date(p.datePaid))))
              : null;
            
            return mostRecentPayment && mostRecentPayment >= thirtyDaysAgo;
          });
        }
        
        // Sort by date
        displayExpenses = displayExpenses.sort((a, b) => new Date(a.dateDue) - new Date(b.dateDue));
        
        return displayExpenses.map(exp => {
          const totalPaid = exp.payments.reduce((sum, p) => sum + p.amount, 0);
          const remaining = exp.amount - totalPaid;
          const isFullyPaid = remaining <= 0;

          return (
            <div key={exp.id} className={`p-3 md:p-4 border rounded-lg shadow-sm ${isFullyPaid ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'} ${exp.isRecurringInstance ? 'border-l-4 border-l-purple-400' : ''}`}>
              {editingExpense === exp.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={exp.name}
                      onChange={(e) => updateExpense(exp.id, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      value={exp.amount}
                      onChange={(e) => updateExpense(exp.id, 'amount', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      type="date"
                      value={exp.dateDue}
                      onChange={(e) => updateExpense(exp.id, 'dateDue', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={exp.isProjected}
                        onChange={(e) => updateExpense(exp.id, 'isProjected', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">Projected</span>
                    </label>
                    {exp.recurringId && (
                      <label className="flex items-center gap-2 text-sm text-purple-700">
                        <input
                          type="checkbox"
                          checked={applyToFuture}
                          onChange={(e) => setApplyToFuture(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="font-medium">Apply to all future</span>
                      </label>
                    )}
                  </div>
                  <button
                    onClick={() => { setEditingExpense(null); setApplyToFuture(false); }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-semibold ${isFullyPaid ? 'text-gray-500' : 'text-gray-800'}`}>
                          {exp.name}
                        </h3>
                        {exp.isProjected && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                            PROJECTED
                          </span>
                        )}
                        {exp.isRecurringInstance && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                            RECURRING
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Due: {formatDate(exp.dateDue)}
                      </p>
                      {isFullyPaid && (
                        <p className="text-sm text-green-600 font-medium">
                          <Check className="w-4 h-4 inline mr-1" />
                          Fully Paid
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <div className="text-left sm:text-right">
                        <span className={`text-lg md:text-xl font-bold ${isFullyPaid ? 'text-gray-500' : exp.isProjected ? 'text-yellow-600' : 'text-red-600'}`}>
                          {formatCurrency(exp.amount)}
                        </span>
                        {totalPaid > 0 && (
                          <div className="text-sm text-green-600">Paid: {formatCurrency(totalPaid)}</div>
                        )}
                        {remaining > 0 && (
                          <div className="text-sm text-orange-600">Remaining: {formatCurrency(remaining)}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {exp.isProjected && (
                          <button
                            onClick={() => actualizeExpense(exp.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium whitespace-nowrap"
                          >
                            Actualize
                          </button>
                        )}
                        <button
                          onClick={() => setEditingExpense(exp.id)}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setExpenses(expenses.filter(e => e.id !== exp.id))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {exp.payments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Payments:</h4>
                      <div className="space-y-2">
                        {exp.payments.map(payment => (
                          <div key={payment.id} className="flex justify-between items-center text-sm bg-green-50 p-2 rounded">
                            <div>
                              <span className="font-medium">{accounts.find(a => a.id === payment.accountId)?.name}</span>
                              <span className="text-gray-500 ml-2">{formatDate(payment.datePaid)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-700 font-semibold">{formatCurrency(payment.amount)}</span>
                              <button
                                onClick={() => deletePayment(exp.id, payment.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {remaining > 0 && (
                    <div className="mt-3">
                      {showPaymentModal === exp.id ? (
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            <input
                              type="number"
                              placeholder="Amount"
                              value={newPayment.amount}
                              max={remaining}
                              onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                            <select
                              value={newPayment.accountId}
                              onChange={(e) => setNewPayment({ ...newPayment, accountId: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded text-sm"
                            >
                              <option value="">Select Account</option>
                              {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                              ))}
                            </select>
                            <input
                              type="date"
                              value={newPayment.datePaid}
                              onChange={(e) => setNewPayment({ ...newPayment, datePaid: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => addPaymentToExpense(exp.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Add Payment
                            </button>
                            <button
                              onClick={() => setShowPaymentModal(null)}
                              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowPaymentModal(exp.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          + Add Payment
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        });
      })()}
    </div>
  </div>
)}

            {activeTab === 'income' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <h2 className="text-2xl font-semibold text-slate-100">Expected Income</h2>
                  <button
                    onClick={() => setShowAddIncome(!showAddIncome)}
                    className="flex items-center gap-1.5 bg-blue-600/20 backdrop-blur-sm text-blue-100 px-3 py-2 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-500/30 text-sm font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add Income</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>

                {showAddIncome && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                     <div className="relative">
  <input
    type="text"
    placeholder="Income name"
    value={newIncome.name}
    onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })}
    list="income-names"
    className="w-full px-3 py-2 border border-gray-300 rounded"
  />
  <datalist id="income-names">
    {getAllIncomeNames().map(name => (
      <option key={name} value={name} />
    ))}
  </datalist>
</div>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newIncome.amount}
                        onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                      <input
                        type="date"
                        value={newIncome.dateExpected}
                        onChange={(e) => setNewIncome({ ...newIncome, dateExpected: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                      <select
                        value={newIncome.accountId}
                        onChange={(e) => setNewIncome({ ...newIncome, accountId: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded"
                      >
                        <option value="">Select Account</option>
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
  <button
    onClick={addIncome}
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
  >
    Save Income
  </button>
  <button
    onClick={() => {
      setShowAddIncome(false);
      setNewIncome({ name: '', amount: '', dateExpected: '', accountId: '' });
    }}
    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
  >
    Cancel
  </button>
</div>
                  </div>
                )}

                <div className="space-y-3">
                  {(() => {
  // Get all actual income (non-recurring instances from income state)
  const actualIncome = income;
  
  // For each active recurring rule, get only the NEXT upcoming instance
  const nextRecurringInstances = recurringIncome
    .filter(r => r.isActive)
    .map(recurring => {
      // Find instances for this recurring rule that are in the future
      const futureInstances = generateRecurringInstances.income
        .filter(inst => 
          inst.recurringId === recurring.id && 
          new Date(inst.dateExpected) >= new Date()
        )
        .sort((a, b) => new Date(a.dateExpected) - new Date(b.dateExpected));
      
      return futureInstances[0]; // Return only the first/next one
    })
    .filter(Boolean); // Remove any undefined
  
  // Combine and sort by date
  const displayIncome = [...actualIncome, ...nextRecurringInstances]
    .sort((a, b) => new Date(a.dateExpected) - new Date(b.dateExpected));
  
  return displayIncome.map(inc => (
                    <div key={inc.id} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 md:p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${inc.isRecurringInstance ? 'border-l-4 border-l-purple-400' : ''}`}>
                      {editingIncome === inc.id ? (
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input
                              type="text"
                              value={inc.name}
                              onChange={(e) => updateIncome(inc.id, 'name', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded"
                              placeholder="Income name"
                            />
                            <input
                              type="number"
                              value={inc.amount}
                              onChange={(e) => updateIncome(inc.id, 'amount', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded"
                              placeholder="Amount"
                            />
                            <input
                              type="date"
                              value={inc.dateExpected}
                              onChange={(e) => updateIncome(inc.id, 'dateExpected', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded"
                            />
                            <select
                              value={inc.accountId}
                              onChange={(e) => updateIncome(inc.id, 'accountId', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded"
                            >
                              <option value="">Select Account</option>
                              {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                              ))}
                            </select>
                          </div>
                          {inc.recurringId && (
                            <label className="flex items-center gap-2 text-sm text-purple-700">
                              <input
                                type="checkbox"
                                checked={applyToFuture}
                                onChange={(e) => setApplyToFuture(e.target.checked)}
                                className="w-4 h-4"
                              />
                              <span className="font-medium">Apply to all future</span>
                            </label>
                          )}
                          <button
                            onClick={() => { setEditingIncome(null); setApplyToFuture(false); }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-800">{inc.name}</h3>
                              {inc.isRecurringInstance && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                                  RECURRING
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              Expected: {formatDate(inc.dateExpected)}
                            </p>
                            <p className="text-sm text-gray-500">
                              To: {accounts.find(a => a.id === inc.accountId)?.name}
                            </p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                            <span className="text-lg md:text-xl font-bold text-green-600">{formatCurrency(inc.amount)}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingIncome(inc.id)}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setIncome(income.filter(i => i.id !== inc.id))}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                                    ));
                })()}
                </div>
              </div>
            )}

            {activeTab === 'recurring' && (
              <div className="space-y-8">
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <h2 className="text-2xl font-semibold text-slate-100">Recurring Expenses</h2>
                    <button
                      onClick={() => setShowAddRecurringExpense(!showAddRecurringExpense)}
                      className="flex items-center gap-1.5 bg-blue-600/20 backdrop-blur-sm text-blue-100 px-3 py-2 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-500/30 text-sm font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add Recurring Expense</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>

                  {showAddRecurringExpense && (
  <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
      <div className="relative">
        <input
          type="text"
          placeholder="Expense name"
          value={newRecurringExpense.name}
          onChange={(e) => setNewRecurringExpense({ ...newRecurringExpense, name: e.target.value })}
          list="recurring-expense-names"
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
        <datalist id="recurring-expense-names">
          {getAllExpenseNames().map(name => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={newRecurringExpense.amount}
                          onChange={(e) => setNewRecurringExpense({ ...newRecurringExpense, amount: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                        <select
                          value={newRecurringExpense.frequency}
                          onChange={(e) => setNewRecurringExpense({ ...newRecurringExpense, frequency: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                        <input
                          type="date"
                          value={newRecurringExpense.startDate}
                          onChange={(e) => setNewRecurringExpense({ ...newRecurringExpense, startDate: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm mb-3">
                        <input
                          type="checkbox"
                          checked={newRecurringExpense.isProjected}
                          onChange={(e) => setNewRecurringExpense({ ...newRecurringExpense, isProjected: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span>Projected</span>
                      </label>
                      <div className="flex gap-2">
  <button 
    onClick={addRecurringExpense} 
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
    Save Recurring Expense
  </button>
  <button
    onClick={() => {
      setShowAddRecurringExpense(false);
      setNewRecurringExpense({ name: '', amount: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0], isProjected: false });
    }}
    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
  >
    Cancel
  </button>
</div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {recurringExpenses.map(rec => (
                      <div key={rec.id} className={`p-4 border rounded-lg ${rec.isActive ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300'}`}>
                        {editingRecurringExpense === rec.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-4 gap-3">
                              <input
                                type="text"
                                value={rec.name}
                                onChange={(e) => setRecurringExpenses(recurringExpenses.map(r => r.id === rec.id ? { ...r, name: e.target.value } : r))}
                                className="px-3 py-2 border border-gray-300 rounded"
                              />
                              <input
                                type="number"
                                value={rec.amount}
                                onChange={(e) => setRecurringExpenses(recurringExpenses.map(r => r.id === rec.id ? { ...r, amount: parseFloat(e.target.value) } : r))}
                                className="px-3 py-2 border border-gray-300 rounded"
                              />
                              <select
                                value={rec.frequency}
                                onChange={(e) => setRecurringExpenses(recurringExpenses.map(r => r.id === rec.id ? { ...r, frequency: e.target.value } : r))}
                                className="px-3 py-2 border border-gray-300 rounded"
                              >
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Bi-weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                              </select>
                              <input
                                type="date"
                                value={rec.startDate}
                                onChange={(e) => setRecurringExpenses(recurringExpenses.map(r => r.id === rec.id ? { ...r, startDate: e.target.value } : r))}
                                className="px-3 py-2 border border-gray-300 rounded"
                              />
                            </div>
                            <button onClick={() => setEditingRecurringExpense(null)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                              Done
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
  <div className="flex-1">
    <div className="flex items-center gap-2 flex-wrap">
      <h3 className={`font-semibold ${rec.isActive ? 'text-gray-800' : 'text-gray-500'}`}>{rec.name}</h3>
      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{rec.frequency.toUpperCase()}</span>
      {rec.isProjected && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">PROJECTED</span>}
      {!rec.isActive && <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">INACTIVE</span>}
    </div>
    <p className="text-sm text-gray-600 mt-1">Starts: {formatDate(rec.startDate)}</p>
  </div>
  <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
    <span className={`text-lg md:text-xl font-bold ${rec.isActive ? 'text-red-600' : 'text-gray-500'}`}>{formatCurrency(rec.amount)}</span>
    <div className="flex items-center gap-2">
      <button
        onClick={() => setRecurringExpenses(recurringExpenses.map(r => r.id === rec.id ? { ...r, isActive: !r.isActive } : r))}
        className={`px-3 py-1 rounded text-sm ${rec.isActive ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}
      >
        {rec.isActive ? 'Pause' : 'Activate'}
      </button>
      <button onClick={() => setEditingRecurringExpense(rec.id)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
      <button onClick={() => setRecurringExpenses(recurringExpenses.filter(r => r.id !== rec.id))} className="text-red-500 hover:text-red-700">
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  </div>
</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <h2 className="text-2xl font-semibold text-slate-100">Recurring Income</h2>
                    <button
                      onClick={() => setShowAddRecurringIncome(!showAddRecurringIncome)}
                      className="flex items-center gap-1.5 bg-blue-600/20 backdrop-blur-sm text-blue-100 px-3 py-2 rounded-lg hover:bg-blue-600/30 transition-all border border-blue-500/30 text-sm font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add Recurring Income</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>

                 {showAddRecurringIncome && (
  <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      <div className="relative">
        <input
          type="text"
          placeholder="Income name"
          value={newRecurringIncome.name}
          onChange={(e) => setNewRecurringIncome({ ...newRecurringIncome, name: e.target.value })}
          list="recurring-income-names"
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
        <datalist id="recurring-income-names">
          {getAllIncomeNames().map(name => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={newRecurringIncome.amount}
                          onChange={(e) => setNewRecurringIncome({ ...newRecurringIncome, amount: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                        <select
                          value={newRecurringIncome.frequency}
                          onChange={(e) => setNewRecurringIncome({ ...newRecurringIncome, frequency: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                        <input
                          type="date"
                          value={newRecurringIncome.startDate}
                          onChange={(e) => setNewRecurringIncome({ ...newRecurringIncome, startDate: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                        <select
                          value={newRecurringIncome.accountId}
                          onChange={(e) => setNewRecurringIncome({ ...newRecurringIncome, accountId: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded"
                        >
                          <option value="">Select Account</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 mt-3">
  <button 
    onClick={addRecurringIncome} 
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
    Save Recurring Income
  </button>
  <button
    onClick={() => {
      setShowAddRecurringIncome(false);
      setNewRecurringIncome({ name: '', amount: '', frequency: 'monthly', startDate: new Date().toISOString().split('T')[0], accountId: '' });
    }}
    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
  >
    Cancel
  </button>
</div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {recurringIncome.map(rec => (
                      <div key={rec.id} className={`p-4 border rounded-lg ${rec.isActive ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300'}`}>
                        {editingRecurringIncome === rec.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-5 gap-3">
                              <input
                                type="text"
                                value={rec.name}
                                onChange={(e) => setRecurringIncome(recurringIncome.map(r => r.id === rec.id ? { ...r, name: e.target.value } : r))}
                                className="px-3 py-2 border border-gray-300 rounded"
                              />
                              <input
                                type="number"
                                value={rec.amount}
                                onChange={(e) => setRecurringIncome(recurringIncome.map(r => r.id === rec.id ? { ...r, amount: parseFloat(e.target.value) } : r))}
                                className="px-3 py-2 border border-gray-300 rounded"
                              />
                              <select
                                value={rec.frequency}
                                onChange={(e) => setRecurringIncome(recurringIncome.map(r => r.id === rec.id ? { ...r, frequency: e.target.value } : r))}
                                className="px-3 py-2 border border-gray-300 rounded"
                              >
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Bi-weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                              </select>
                              <input
                                type="date"
                                value={rec.startDate}
                                onChange={(e) => setRecurringIncome(recurringIncome.map(r => r.id === rec.id ? { ...r, startDate: e.target.value } : r))}
                                className="px-3 py-2 border border-gray-300 rounded"
                              />
                              <select
                                value={rec.accountId}
                                onChange={(e) => setRecurringIncome(recurringIncome.map(r => r.id === rec.id ? { ...r, accountId: parseInt(e.target.value) } : r))}
                                className="px-3 py-2 border border-gray-300 rounded"
                              >
                                {accounts.map(acc => (
                                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                              </select>
                            </div>
                            <button onClick={() => setEditingRecurringIncome(null)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                              Done
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
  <div className="flex-1">
    <div className="flex items-center gap-2 flex-wrap">
      <h3 className={`font-semibold ${rec.isActive ? 'text-gray-800' : 'text-gray-500'}`}>{rec.name}</h3>
      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{rec.frequency.toUpperCase()}</span>
      {!rec.isActive && <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">INACTIVE</span>}
    </div>
    <p className="text-sm text-gray-600 mt-1">Starts: {formatDate(rec.startDate)} • To: {accounts.find(a => a.id === rec.accountId)?.name}</p>
  </div>
  <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
    <span className={`text-lg md:text-xl font-bold ${rec.isActive ? 'text-green-600' : 'text-gray-500'}`}>{formatCurrency(rec.amount)}</span>
    <div className="flex items-center gap-2">
      <button
        onClick={() => setRecurringIncome(recurringIncome.map(r => r.id === rec.id ? { ...r, isActive: !r.isActive } : r))}
        className={`px-3 py-1 rounded text-sm ${rec.isActive ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}
      >
        {rec.isActive ? 'Pause' : 'Activate'}
      </button>
      <button onClick={() => setEditingRecurringIncome(rec.id)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
      <button onClick={() => setRecurringIncome(recurringIncome.filter(r => r.id !== rec.id))} className="text-red-500 hover:text-red-700">
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  </div>
</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

{activeTab === 'planning' && (
  <div>
    {/* Sub-tab navigation */}
    <div className="flex gap-2 mb-6 border-b border-slate-700/50">
      <button
        onClick={() => setPlanningSubTab('calendar')}
        className={`px-6 py-3 font-semibold transition-all relative ${
          planningSubTab === 'calendar'
            ? 'text-blue-400'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        Calendar
        {planningSubTab === 'calendar' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
        )}
      </button>
      <button
        onClick={() => setPlanningSubTab('projections')}
        className={`px-6 py-3 font-semibold transition-all relative ${
          planningSubTab === 'projections'
            ? 'text-blue-400'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        Projections
        {planningSubTab === 'projections' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
        )}
      </button>
    <button
  onClick={() => setPlanningSubTab('analytics')}
  className={`px-6 py-3 font-semibold transition-all relative ${
    planningSubTab === 'analytics'
      ? 'text-blue-400'
      : 'text-slate-400 hover:text-slate-200'
  }`}
>
  Analytics
  {planningSubTab === 'analytics' && (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
  )}
</button>
    </div>



    {/* Calendar content */}
    {planningSubTab === 'calendar' && (
      <div className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-slate-800/50 backdrop-blur-sm p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-700/50">
  <button
    onClick={() => {
      const newDate = new Date(calendarDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setCalendarDate(newDate);
    }}
    className="px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600/20 text-blue-100 rounded-lg sm:rounded-xl hover:bg-blue-600/30 transition-all border border-blue-500/30 text-xs sm:text-sm font-medium"
  >
    ← Prev
  </button>
  <h2 className="text-base sm:text-xl md:text-2xl font-bold text-slate-100 px-2">
    {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
  </h2>
  <button
    onClick={() => {
      const newDate = new Date(calendarDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setCalendarDate(newDate);
    }}
    className="px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600/20 text-blue-100 rounded-lg sm:rounded-xl hover:bg-blue-600/30 transition-all border border-blue-500/30 text-xs sm:text-sm font-medium"
  >
    Next →
  </button>
</div>

                {(() => {
                  const year = calendarDate.getFullYear();
                  const month = calendarDate.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  
                  const calendarDays = [];
                  for (let i = 0; i < firstDay; i++) {
                    calendarDays.push(null);
                  }
                  for (let day = 1; day <= daysInMonth; day++) {
                    calendarDays.push(day);
                  }

                  const getItemsForDay = (day) => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayExpenses = allExpenses.filter(e => e.dateDue === dateStr);
                    const dayIncome = allIncome.filter(i => i.dateExpected === dateStr);
                    return { expenses: dayExpenses, income: dayIncome };
                  };

                  return (
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                      <div className="grid grid-cols-7 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center font-bold text-slate-300 py-2">
                            {day}
                          </div>
                        ))}
                        {calendarDays.map((day, idx) => {
  if (!day) {
    return <div key={idx} className="aspect-square"></div>;
  }
  
  const { expenses: dayExpenses, income: dayIncome } = getItemsForDay(day);
  const today = new Date();
  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = selectedCalendarDay === day;
  
  // Check for unpaid expenses
  const hasUnpaidExpenses = dayExpenses.some(exp => {
    const totalPaid = exp.payments.reduce((sum, p) => sum + p.amount, 0);
    return totalPaid < exp.amount;
  });
  
  const hasIncome = dayIncome.length > 0;
  const hasBoth = hasUnpaidExpenses && hasIncome;

  return (
    <div
      key={idx}
      onClick={() => setSelectedCalendarDay(day)}
      className={`aspect-square border rounded-lg sm:rounded-xl p-1 sm:p-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-400 bg-blue-500/20 ring-2 ring-blue-400/50'
          : isToday 
          ? 'border-blue-500 bg-blue-500/10 hover:bg-blue-500/20' 
          : 'border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 hover:border-slate-600'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-blue-300' : isToday ? 'text-blue-300' : 'text-slate-300'}`}>
          {day}
        </div>
        {(hasIncome || hasUnpaidExpenses) && (
          <div className="flex gap-0.5">
            {hasBoth ? (
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-400 border border-yellow-500 shadow-sm"></div>
            ) : hasIncome ? (
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 border border-emerald-500 shadow-sm"></div>
            ) : (
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-400 border border-rose-500 shadow-sm"></div>
            )}
          </div>
        )}
      </div>
      
      {/* Desktop view - show items */}
      <div className="hidden sm:block space-y-1 overflow-y-auto max-h-20">
        {dayIncome.map((inc, i) => (
          <div
            key={`inc-${i}`}
            className="text-xs px-1 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 truncate leading-tight"
          >
            {inc.name}
          </div>
        ))}
        {dayExpenses.map((exp, i) => {
          const totalPaid = exp.payments.reduce((sum, p) => sum + p.amount, 0);
          const isPaid = totalPaid >= exp.amount;
          return (
            <div
              key={`exp-${i}`}
              className={`text-xs px-1 py-0.5 rounded border truncate leading-tight ${
                isPaid
                  ? 'bg-slate-600/20 text-slate-400 border-slate-600/30'
                  : exp.isProjected
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              {exp.name}
            </div>
          );
        })}
      </div>
      
     
    </div>
  );
})}
                      </div>
                    </div>
                  );
                })()}

                {selectedCalendarDay && (() => {
                  const year = calendarDate.getFullYear();
                  const month = calendarDate.getMonth();
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedCalendarDay).padStart(2, '0')}`;
                  const dayExpenses = allExpenses.filter(e => e.dateDue === dateStr);
                  const dayIncome = allIncome.filter(i => i.dateExpected === dateStr);
                  
                  return (
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-100">
                          Details for {new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </h3>
                        <button
                          onClick={() => setSelectedCalendarDay(null)}
                          className="text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          ✕ Close
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
                            <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                            Income ({dayIncome.length})
                          </h4>
                          {dayIncome.length === 0 ? (
                            <p className="text-slate-400 text-sm p-4 bg-slate-900/30 rounded-lg">No income on this day</p>
                          ) : (
                            <div className="space-y-3">
                              {dayIncome.map(inc => (
                                <div key={inc.id} className="p-4 bg-emerald-500/10 backdrop-blur-sm rounded-lg border border-emerald-500/30">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="font-semibold text-slate-100">{inc.name}</h5>
                                      {inc.isRecurringInstance && (
                                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 inline-block mt-1">REC</span>
                                      )}
                                      <p className="text-sm text-slate-400 mt-1">To: {accounts.find(a => a.id === inc.accountId)?.name}</p>
                                    </div>
                                    <span className="text-lg font-bold text-emerald-400">{formatCurrency(inc.amount)}</span>
                                  </div>
                                </div>
                              ))}
                              <div className="pt-3 border-t border-emerald-500/30">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-slate-300">Total Income:</span>
                                  <span className="text-xl font-bold text-emerald-400">
                                    {formatCurrency(dayIncome.reduce((sum, i) => sum + i.amount, 0))}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-rose-300 mb-4 flex items-center gap-2">
                            <div className="w-1 h-5 bg-rose-500 rounded-full"></div>
                            Expenses ({dayExpenses.length})
                          </h4>
                          {dayExpenses.length === 0 ? (
                            <p className="text-slate-400 text-sm p-4 bg-slate-900/30 rounded-lg">No expenses on this day</p>
                          ) : (
                            <div className="space-y-3">
                              {dayExpenses.map(exp => {
                                const totalPaid = exp.payments.reduce((sum, p) => sum + p.amount, 0);
                                const remaining = exp.amount - totalPaid;
                                const isPaid = remaining <= 0;
                                return (
                                  <div key={exp.id} className={`p-4 backdrop-blur-sm rounded-lg border ${
                                    isPaid ? 'bg-slate-600/10 border-slate-600/30' : exp.isProjected ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-rose-500/10 border-rose-500/30'
                                  }`}>
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h5 className={`font-semibold ${isPaid ? 'text-slate-400' : 'text-slate-100'}`}>{exp.name}</h5>
                                          {exp.isProjected && (
                                            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30">PROJ</span>
                                          )}
                                          {exp.isRecurringInstance && (
                                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">REC</span>
                                          )}
                                          {isPaid && (
                                            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                                              <Check className="w-3 h-3" /> PAID
                                            </span>
                                          )}
                                        </div>
                                        {totalPaid > 0 && (
                                          <p className="text-sm text-emerald-400 mt-1">Paid: {formatCurrency(totalPaid)}</p>
                                        )}
                                        {remaining > 0 && (
                                          <p className="text-sm text-orange-400 mt-1">Remaining: {formatCurrency(remaining)}</p>
                                        )}
                                      </div>
                                      <span className={`text-lg font-bold ml-2 ${isPaid ? 'text-slate-400' : exp.isProjected ? 'text-yellow-400' : 'text-rose-400'}`}>
                                        {formatCurrency(exp.amount)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="pt-3 border-t border-rose-500/30 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-400">Total Expenses:</span>
                                  <span className="font-semibold text-slate-300">
                                    {formatCurrency(dayExpenses.reduce((sum, e) => sum + e.amount, 0))}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-400">Paid:</span>
                                  <span className="font-semibold text-emerald-400">
                                    {formatCurrency(dayExpenses.reduce((sum, e) => sum + e.payments.reduce((s, p) => s + p.amount, 0), 0))}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-rose-500/20">
                                  <span className="font-semibold text-slate-300">Unpaid:</span>
                                  <span className="text-xl font-bold text-rose-400">
                                    {formatCurrency(dayExpenses.reduce((sum, e) => {
                                      const totalPaid = e.payments.reduce((s, p) => s + p.amount, 0);
                                      return sum + (e.amount - totalPaid);
                                    }, 0))}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-700/50">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-slate-300">Net for Day:</span>
                          <span className={`text-2xl font-bold ${
                            (dayIncome.reduce((sum, i) => sum + i.amount, 0) - 
                            dayExpenses.reduce((sum, e) => {
                              const totalPaid = e.payments.reduce((s, p) => s + p.amount, 0);
                              return sum + (e.amount - totalPaid);
                            }, 0)) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {formatCurrency(
                              dayIncome.reduce((sum, i) => sum + i.amount, 0) - 
                              dayExpenses.reduce((sum, e) => {
                                const totalPaid = e.payments.reduce((s, p) => s + p.amount, 0);
                                return sum + (e.amount - totalPaid);
                              }, 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-emerald-600/10 backdrop-blur-sm p-4 rounded-xl border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                      <span className="text-sm font-semibold text-emerald-300">Income</span>
                    </div>
                    <p className="text-xs text-emerald-200">Expected income for the month</p>
                  </div>
                  <div className="bg-rose-600/10 backdrop-blur-sm p-4 rounded-xl border border-rose-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-rose-500 rounded"></div>
                      <span className="text-sm font-semibold text-rose-300">Unpaid Expenses</span>
                    </div>
                    <p className="text-xs text-rose-200">Expenses that haven't been paid yet</p>
                  </div>
                  <div className="bg-slate-600/10 backdrop-blur-sm p-4 rounded-xl border border-slate-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-slate-500 rounded"></div>
                      <span className="text-sm font-semibold text-slate-300">Paid Expenses</span>
                    </div>
                    <p className="text-xs text-slate-200">Expenses that have been paid</p>
                  </div>
                </div>
              </div>
            )
      </div>
    )}

    {/* Projections content */}
    {planningSubTab === 'projections' && (
      <div className="space-y-6">
              <div className="space-y-6">
                <div className="bg-slate-800/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-slate-700/50">
  <h3 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wide">Period Filter</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Start Date</label>
      <input
        type="date"
        value={projectionsDateRange.startDate}
        onChange={(e) => setprojectionsDateRange({ ...projectionsDateRange, startDate: e.target.value })}
        className="w-full px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
    </div>
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">End Date</label>
      <input
        type="date"
        value={projectionsDateRange.endDate}
        onChange={(e) => setprojectionsDateRange({ ...projectionsDateRange, endDate: e.target.value })}
        className="w-full px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
    </div>
  </div>
</div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Current Balance</h3>
                    <p className="text-xs text-green-700 mb-4">After all paid expenses</p>
                    <div className="space-y-3">
                      {accounts.map(acc => {
                        let balance = acc.balance;
                        allExpenses.forEach(exp => {
                          exp.payments.forEach(payment => {
                            if (payment.accountId === acc.id) {
                              balance -= payment.amount;
                            }
                          });
                        });
                        return (
                          <div key={acc.id} className="flex justify-between items-center pb-2 border-b border-green-200 last:border-0">
                            <span className="text-sm font-medium text-green-800">{acc.name}</span>
                            <span className="text-sm font-bold text-green-900">{formatCurrency(balance)}</span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between items-center pt-2 border-t-2 border-green-300">
                        <span className="text-base font-bold text-green-900">Total Current</span>
                        <span className="text-2xl font-bold text-green-900">
                          {formatCurrency(projectionsTimeline.currentBalance)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Projected End Balance</h3>
                    <p className="text-xs text-blue-700 mb-4">After all income & expenses in period</p>
                    <div className="space-y-4">
                      <div className="text-sm text-blue-800 space-y-2">
                        <div className="flex justify-between pb-2 border-b border-blue-200">
                          <span>Current Balance:</span>
                          <span className="font-semibold">{formatCurrency(projectionsTimeline.currentBalance)}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-blue-200">
                          <span>Expected Income:</span>
                          <span className="font-semibold text-green-700">+{formatCurrency(projectionsFilteredIncome.reduce((sum, i) => sum + i.amount, 0))}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-blue-200">
                          <span>Unpaid Expenses:</span>
                          <span className="font-semibold text-red-700">-{formatCurrency(projectionsFilteredExpenses.reduce((sum, e) => {
                            const totalPaid = e.payments.reduce((s, p) => s + p.amount, 0);
                            return sum + (e.amount - totalPaid);
                          }, 0))}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t-2 border-blue-300">
                        <span className="text-base font-bold text-blue-900">Projected End</span>
                        <span className="text-2xl font-bold text-blue-900">
                          {formatCurrency(projectionsTimeline.projectedEndBalance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Cashflow Timeline ({formatDate(projectionsDateRange.startDate)} - {formatDate(projectionsDateRange.endDate)})
                  </h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
  {projectionsTimeline.timeline.length === 0 ? (
    <p className="text-gray-500 text-center p-6 bg-gray-50 rounded">No transactions in this period</p>
  ) : (
    <>
      {projectionsTimeline.timeline
        .slice(0, showAllProjections ? projectionsTimeline.timeline.length : 15)
        .map((event, idx) => (
                        <div key={idx} className={`p-3 md:p-4 border rounded-lg transition-all hover:shadow-md ${
                          event.type === 'income' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
  <div className="flex-1">
    <div className="flex items-center gap-2 flex-wrap">
      <h3 className="font-medium text-sm sm:text-base text-gray-800">{event.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded font-medium ${
                                  event.type === 'income' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                }`}>
                                  {event.type === 'income' ? 'INCOME' : 'EXPENSE'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {formatDate(event.date)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xl font-bold ${
                                event.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {event.type === 'income' ? '+' : ''}{formatCurrency(event.amount)}
                              </p>
                              <div className="mt-1 text-sm">
                                <span className="text-gray-500">Balance: </span>
                                <span className={`font-semibold ${
                                  event.totalBalance >= 0 ? 'text-gray-800' : 'text-red-600'
                                }`}>
                                  {formatCurrency(event.totalBalance)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
      }
      {projectionsTimeline.timeline.length > 15 && (
        <button
          onClick={() => setShowAllProjections(!showAllProjections)}
          className="w-full mt-3 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white hover:bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all"
        >
          {showAllProjections ? `Show Less (${projectionsTimeline.timeline.length} total)` : `Show More (${projectionsTimeline.timeline.length - 15} more events)`}
        </button>
      )}
    </>
  )}
</div>
                </div>
              </div>
            )
     </div>
    )}

    {/* Analytics content */}
{planningSubTab === 'analytics' && (
  <div className="space-y-6">
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/20">
      <h2 className="text-3xl font-bold text-slate-100 mb-2">Expense Analytics</h2>
      <p className="text-slate-300">Historical spending breakdown by expense</p>
    </div>

    {(() => {
      // Calculate date range based on selected period
      const now = new Date();
      let startDate = new Date();
      
      switch(analyticsPeriod) {
        case '1month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case 'ytd':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      // Group expenses by month to calculate true monthly average
      const monthlyTotals = {};
      
      // Group expenses by name and calculate totals
      const expenseGroups = {};
      let grandTotalPaid = 0; // Track actual payments separately

      // Process all expenses in the date range
      allExpenses.forEach(exp => {
        const expDueDate = new Date(exp.dateDue);
        const isInRange = expDueDate >= startDate;
        
        if (!expenseGroups[exp.name]) {
          expenseGroups[exp.name] = {
            name: exp.name,
            total: 0,        // Total expense amounts (actuals)
            totalPaid: 0,    // Actual payments made
            projected: 0,    // Total projected/budgeted amounts
            projectedMonths: new Set(), // Track which months have projected expenses
            count: 0,
            isRecurring: !!exp.recurringId
          };
        }
        
        // Track all actual (non-projected) expenses
        if (isInRange && !exp.isProjected) {
          expenseGroups[exp.name].total += exp.amount;
          expenseGroups[exp.name].count += 1;
          
          // Track by month for average calculation
          const monthKey = `${expDueDate.getFullYear()}-${expDueDate.getMonth()}`;
          if (!monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] = 0;
          }
          monthlyTotals[monthKey] += exp.amount;
          
          // Track actual payments made (only count payments in the past)
          const totalPaid = exp.payments.reduce((sum, p) => {
            const paymentDate = new Date(p.datePaid);
            if (paymentDate >= startDate && paymentDate <= now) {
              return sum + p.amount;
            }
            return sum;
          }, 0);
          
          expenseGroups[exp.name].totalPaid += totalPaid;
          grandTotalPaid += totalPaid;
        }
        
        // Track projected expenses separately (for budgeting comparison)
        if (isInRange && exp.isProjected) {
          const monthKey = `${expDueDate.getFullYear()}-${expDueDate.getMonth()}`;
          expenseGroups[exp.name].projected += exp.amount;
          expenseGroups[exp.name].projectedMonths.add(monthKey);
        }
      });
      
      // Calculate metrics
      const monthsWithExpenses = Math.max(1, Object.keys(monthlyTotals).length);
      const totalOfAllMonths = Object.values(monthlyTotals).reduce((sum, total) => sum + total, 0);
      const avgPerMonth = monthsWithExpenses > 0 ? totalOfAllMonths / monthsWithExpenses : 0;
      
      // Convert to array and sort by total (highest to lowest)
      let sortedExpenses = Object.values(expenseGroups)
  .sort((a, b) => b.total - a.total);

// Apply expense filter if any are selected
const filteredExpenses = selectedExpenses.length === 0 
  ? sortedExpenses 
  : sortedExpenses.filter(exp => selectedExpenses.includes(exp.name));
      
      const grandTotal = filteredExpenses.reduce((sum, exp) => sum + exp.total, 0);
      
      return (
        <>
          {/* Expense Filter */}
{sortedExpenses.length > 0 && (
  <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-slate-300">Filter Expenses</h3>
      <button
  onClick={() => setSelectedExpenses([])}
  className="text-xs px-3 py-1.5 bg-slate-700/30 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-all font-medium"
>
  Show All
</button>
    </div>
    <div className="flex flex-wrap gap-2">
      {sortedExpenses.map((exp) => {
        const isSelected = selectedExpenses.length === 0 || selectedExpenses.includes(exp.name);
        return (
          <button
            key={exp.name}
            onClick={() => {
              if (selectedExpenses.length === 0) {
                // Currently showing all, select only this one
                setSelectedExpenses([exp.name]);
              } else if (selectedExpenses.includes(exp.name)) {
                // Currently selected, remove it
                const newSelected = selectedExpenses.filter(n => n !== exp.name);
                setSelectedExpenses(newSelected);
              } else {
                // Not selected, add it
                setSelectedExpenses([...selectedExpenses, exp.name]);
              }
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isSelected
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            {exp.name}
          </button>
        );
      })}
    </div>
  </div>
)}

          {/* Summary Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">Total Paid</p>
                <p className="text-3xl font-bold text-blue-400">{formatCurrency(grandTotalPaid)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Average per Month</p>
                <p className="text-3xl font-bold text-purple-400">{formatCurrency(avgPerMonth)}</p>
                <p className="text-xs text-slate-500 mt-1">Based on monthly totals</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Unique Expenses</p>
                <p className="text-3xl font-bold text-emerald-400">{sortedExpenses.length}</p>
              </div>
            </div>
          </div>

          {/* Expense Breakdown Table */}
          {filteredExpenses.length > 0 ? (
  <>
    {/* Desktop Table View - Hidden on Mobile */}
    <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
        <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-gray-700">
          <div>Expense</div>
          <div className="text-right">Total Paid</div>
          <div className="text-right">Total Amount</div>
          <div className="text-right">Avg Budgeted/Mo</div>
          <div className="text-right">% of Total</div>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {filteredExpenses.map((exp, idx) => {
            const avgPerMonth = exp.total / monthsWithExpenses;
            const percentage = (exp.total / grandTotal) * 100;
          
          return (
            <div 
              key={idx}
              className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{exp.name}</p>
                  {exp.isRecurring && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Recurring</span>
                  )}
                </div>
              </div>
              <div className="text-right font-semibold text-green-600 flex items-center justify-end">
                {formatCurrency(exp.totalPaid)}
              </div>
              <div className="text-right font-bold text-gray-800 flex items-center justify-end">
                {formatCurrency(exp.total)}
              </div>
              <div className="text-right font-semibold text-purple-600 flex items-center justify-end">
                {exp.projectedMonths.size > 0 ? formatCurrency(exp.projected / exp.projectedMonths.size) : '-'}
              </div>
              <div className="text-right flex items-center justify-end">
                <div className="w-full max-w-[120px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Mobile Card View - Hidden on Desktop */}
    <div className="md:hidden space-y-4">
      {filteredExpenses.map((exp, idx) => {
        const avgPerMonth = exp.total / monthsWithExpenses;
        const percentage = (exp.total / grandTotal) * 100;
        
        return (
          <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            {/* Header with rank and name */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{exp.name}</h3>
                {exp.isRecurring && (
                  <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Recurring</span>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-3">
              {/* Total Paid */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Total Paid</span>
                <span className="text-lg font-semibold text-green-600">{formatCurrency(exp.totalPaid)}</span>
              </div>

              {/* Total Amount */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Total Amount</span>
                <span className="text-xl font-bold text-gray-800">{formatCurrency(exp.total)}</span>
              </div>

              {/* Avg Recurring */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Avg Budgeted/Mo</span>
                <span className="text-lg font-semibold text-purple-600">
                  {exp.projectedMonths.size > 0 ? formatCurrency(exp.projected / exp.projectedMonths.size) : '-'}
                </span>
              </div>

              {/* Percentage bar */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 font-medium">% of Total</span>
                  <span className="text-lg font-bold text-gray-800">{percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </>
) : (
            <div className="bg-slate-800/50 backdrop-blur-sm p-12 rounded-2xl border border-slate-700/50 text-center">
              <p className="text-slate-400 text-lg">No expense data for this period</p>
              <p className="text-slate-500 text-sm mt-2">Start tracking payments to see analytics</p>
            </div>
          )}
        </>
      );
    })()}
  </div>
)}
  </div>
)}

            
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [showGuestWarning, setShowGuestWarning] = useState(true);  // ADD THIS LINE

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Auth user={user} onGuestMode={() => setIsGuest(true)} />;
  }

  return (
  <>
    {isGuest && showGuestWarning && (
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <span className="text-white text-sm font-medium">Guest Mode - </span>
            <span className="text-slate-400 text-sm">Your data will not be saved.</span>
            <button
              onClick={() => setIsGuest(false)}
              className="ml-2 text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Sign in to save
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowGuestWarning(false)}
          className="text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )}
    <CashflowTracker 
      userId={user?.uid || null} 
      user={user} 
      isGuest={isGuest}
      onSignOut={() => {
        if (isGuest) {
          setIsGuest(false);
        } else {
          auth.signOut();
        }
      }}
    />
  </>
);
}