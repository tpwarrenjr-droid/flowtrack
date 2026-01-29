import { useState, useMemo, useEffect } from 'react';
import { DollarSign, Plus, Trash2, Check, Calendar, Wallet } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Auth from './components/Auth';
import { firestoreStorage } from './utils/firestoreStorage';

function CashflowTracker({ userId }) {
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [recurringIncome, setRecurringIncome] = useState([]);
  
  const [activeTab, setActiveTab] = useState('Welcome');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddRecurringExpense, setShowAddRecurringExpense] = useState(false);
  const [showAddRecurringIncome, setShowAddRecurringIncome] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingRecurringExpense, setEditingRecurringExpense] = useState(null);
  const [editingRecurringIncome, setEditingRecurringIncome] = useState(null);
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
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const accountsData = await firestoreStorage.get(userId, 'cashflow-accounts');
      const expensesData = await firestoreStorage.get(userId, 'cashflow-expenses');
      const incomeData = await firestoreStorage.get(userId, 'cashflow-income');
      const recurringExpData = await firestoreStorage.get(userId, 'cashflow-recurring-expenses');
      const recurringIncData = await firestoreStorage.get(userId, 'cashflow-recurring-income');

      if (accountsData?.value) {
        setAccounts(JSON.parse(accountsData.value));
      } else {
        setAccounts([{ id: 1, name: 'Checking Account', balance: 5000, date: '2026-01-23' }]);
      }

      if (expensesData?.value) {
        setExpenses(JSON.parse(expensesData.value));
      } else {
        setExpenses([{ id: 1, name: 'Rent', amount: 1500, dateDue: '2026-02-01', payments: [], isProjected: false, recurringId: null, isRecurringInstance: false }]);
      }

      if (incomeData?.value) {
        setIncome(JSON.parse(incomeData.value));
      } else {
        setIncome([{ id: 1, name: 'Salary', amount: 4000, dateExpected: '2026-02-01', accountId: 1, recurringId: null, isRecurringInstance: false }]);
      }

      if (recurringExpData?.value) {
        setRecurringExpenses(JSON.parse(recurringExpData.value));
      } else {
        setRecurringExpenses([{ id: 1, name: 'Internet Bill', amount: 80, frequency: 'monthly', startDate: '2026-01-15', isProjected: false, isActive: true }]);
      }

      if (recurringIncData?.value) {
        setRecurringIncome(JSON.parse(recurringIncData.value));
      } else {
        setRecurringIncome([{ id: 1, name: 'Paycheck', amount: 2000, frequency: 'biweekly', startDate: '2026-01-15', accountId: 1, isActive: true }]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setAccounts([{ id: 1, name: 'Checking Account', balance: 5000, date: '2026-01-23' }]);
      setExpenses([{ id: 1, name: 'Rent', amount: 1500, dateDue: '2026-02-01', payments: [], isProjected: false, recurringId: null, isRecurringInstance: false }]);
      setIncome([{ id: 1, name: 'Salary', amount: 4000, dateExpected: '2026-02-01', accountId: 1, recurringId: null, isRecurringInstance: false }]);
      setRecurringExpenses([{ id: 1, name: 'Internet Bill', amount: 80, frequency: 'monthly', startDate: '2026-01-15', isProjected: false, isActive: true }]);
      setRecurringIncome([{ id: 1, name: 'Paycheck', amount: 2000, frequency: 'biweekly', startDate: '2026-01-15', accountId: 1, isActive: true }]);
    } finally {
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
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-8 relative overflow-hidden border-b border-blue-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent)]"></div>
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black flex items-center gap-3 mb-1 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                    FlowTrack
                  </h1>
                  <p className="text-blue-300 text-sm font-medium tracking-wide">Master every dollar, from paycheck to paycheck</p>
                  {lastSaved && (
                    <p className="text-blue-400/60 text-xs mt-1">
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex border-b border-slate-700/50 bg-slate-900/50 overflow-x-auto sticky top-0 z-20 backdrop-blur-sm">
            {['welcome', 'overview', 'accounts', 'expenses', 'income', 'recurring','planning', 'first time here?'].map(tab => (
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
  <div className="max-w-4xl mx-auto space-y-8">
    {/* Welcome Header */}
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/20 text-center">
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
            <h3 className="text-2xl font-semibold text-slate-100 mb-3">Update Your Expenses</h3>
            <p className="text-slate-300 mb-4 text-lg">
              FlowTrack helps you manage <strong className="text-purple-400">cash expenses only</strong> — don't include credit card purchases here.
            </p>
            <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20 mb-4">
              <p className="text-slate-300 mb-2"><strong className="text-purple-300">Action items:</strong></p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Actualize</strong> any projected expenses where you now know the exact amount</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Confirm</strong> all due dates are correct</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Add</strong> any new upcoming expenses</span>
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
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                  <h3 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wide">Period Filter</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Start Date</label>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border-2 border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">End Date</label>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border-2 border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-600/20 backdrop-blur-sm p-6 rounded-2xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 border border-blue-500/30">
                    <p className="text-xs text-blue-300 font-bold uppercase tracking-wide">Income in Period</p>
                    <p className="text-3xl font-bold text-blue-100 mt-2">
                      {formatCurrency(filteredIncome.reduce((sum, i) => sum + i.amount, 0))}
                    </p>
                  </div>

                  <div className="bg-emerald-600/20 backdrop-blur-sm p-6 rounded-2xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 border border-emerald-500/30">
                    <p className="text-xs text-emerald-300 font-bold uppercase tracking-wide">Paid Expenses</p>
                    <p className="text-3xl font-bold text-emerald-100 mt-2">
                      {formatCurrency(filteredExpenses.reduce((sum, e) => sum + e.payments.reduce((s, p) => s + p.amount, 0), 0))}
                    </p>
                  </div>

                  <div className="bg-amber-600/20 backdrop-blur-sm p-6 rounded-2xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30 border border-amber-500/30">
                    <p className="text-xs text-amber-300 font-bold uppercase tracking-wide">Unpaid Expenses</p>
                    <p className="text-3xl font-bold text-amber-100 mt-2">
                      {formatCurrency(filteredExpenses.reduce((sum, e) => {
                        const totalPaid = e.payments.reduce((s, p) => s + p.amount, 0);
                        return sum + (e.amount - totalPaid);
                      }, 0))}
                    </p>
                  </div>

                  <div className="bg-rose-600/20 backdrop-blur-sm p-6 rounded-2xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-rose-500/30 border border-rose-500/30">
                    <p className="text-xs text-rose-300 font-bold uppercase tracking-wide">Total Expenses</p>
                    <p className="text-3xl font-bold text-rose-100 mt-2">
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
                          <span className="text-sm font-medium text-green-800">{acc.name}</span>
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
        <span className="font-medium">Expected Income:</span> <span className="text-green-700">+{formatCurrency(filteredIncome.reduce((sum, i) => sum + i.amount, 0))}</span>
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
          filteredIncome.reduce((sum, i) => sum + i.amount, 0) -
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
                          .map(inc => (
                          <div key={inc.id} className="p-3 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-all">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium text-slate-200">{inc.name}</span>
                                {inc.isRecurringInstance && (
                                  <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">REC</span>
                                )}
                                <div className="text-xs text-slate-400 mt-1">To: {accounts.find(a => a.id === inc.accountId)?.name}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-blue-400">{formatCurrency(inc.amount)}</div>
                                <div className="text-xs text-slate-400">{formatDate(inc.dateExpected)}</div>
                              </div>
                            </div>
                          </div>
                        ))
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-slate-100">Cash Accounts</h2>
                  <button
                    onClick={() => setShowAddAccount(!showAddAccount)}
                    className="flex items-center gap-2 bg-blue-600/20 backdrop-blur-sm text-blue-100 px-4 py-2 rounded-xl hover:bg-blue-600/30 transition-all border border-blue-500/30"
                  >
                    <Plus className="w-4 h-4" />
                    Add Account
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
  <div className="flex justify-between items-center">
    <h2 className="text-2xl font-semibold text-slate-100">Expenses</h2>
    <div className="flex gap-3">
      <button
        onClick={() => setShowPaidExpenses(!showPaidExpenses)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
        showPaidExpenses 
          ? 'bg-emerald-600/20 text-emerald-100 border-emerald-500/30 hover:bg-emerald-600/30'
          : 'bg-slate-700/20 text-slate-300 border-slate-600/30 hover:bg-slate-700/30'
      }`}
    >
      <Check className="w-4 h-4" />
      {showPaidExpenses ? 'Hide Paid' : 'Show Paid (30d)'}
    </button>
    <button
      onClick={() => setShowAddExpense(!showAddExpense)}
      className="flex items-center gap-2 bg-blue-600/20 backdrop-blur-sm text-blue-100 px-4 py-2 rounded-xl hover:bg-blue-600/30 transition-all border border-blue-500/30"
    >
      <Plus className="w-4 h-4" />
      Add Expense
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
                      <div key={exp.id} className={`p-4 border rounded-lg shadow-sm ${isFullyPaid ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'} ${exp.isRecurringInstance ? 'border-l-4 border-l-purple-400' : ''}`}>
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
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
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
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <span className={`text-xl font-bold ${isFullyPaid ? 'text-gray-500' : exp.isProjected ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {formatCurrency(exp.amount)}
                                  </span>
                                  {totalPaid > 0 && (
                                    <div className="text-sm text-green-600">Paid: {formatCurrency(totalPaid)}</div>
                                  )}
                                  {remaining > 0 && (
                                    <div className="text-sm text-orange-600">Remaining: {formatCurrency(remaining)}</div>
                                  )}
                                </div>
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-slate-100">Expected Income</h2>
                  <button
                    onClick={() => setShowAddIncome(!showAddIncome)}
                    className="flex items-center gap-2 bg-blue-600/20 backdrop-blur-sm text-blue-100 px-4 py-2 rounded-xl hover:bg-blue-600/30 transition-all border border-blue-500/30"
                  >
                    <Plus className="w-4 h-4" />
                    Add Income
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
                    <div key={inc.id} className={`flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${inc.isRecurringInstance ? 'border-l-4 border-l-purple-400' : ''}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">{inc.name}</h3>
                          {inc.isRecurringInstance && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                              RECURRING
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Expected: {formatDate(inc.dateExpected)}
                        </p>
                        <p className="text-sm text-gray-500">
                          To: {accounts.find(a => a.id === inc.accountId)?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-green-600">{formatCurrency(inc.amount)}</span>
                        <button
                          onClick={() => setIncome(income.filter(i => i.id !== inc.id))}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                                    ));
                })()}
                </div>
              </div>
            )}

            {activeTab === 'recurring' && (
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-slate-100">Recurring Expenses</h2>
                    <button
                      onClick={() => setShowAddRecurringExpense(!showAddRecurringExpense)}
                      className="flex items-center gap-2 bg-blue-600/20 backdrop-blur-sm text-blue-100 px-4 py-2 rounded-xl hover:bg-blue-600/30 transition-all border border-blue-500/30"
                    >
                      <Plus className="w-4 h-4" />
                      Add Recurring Expense
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
    list="expense-names"
    className="w-full px-3 py-2 border border-gray-300 rounded"
  />
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
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={`font-semibold ${rec.isActive ? 'text-gray-800' : 'text-gray-500'}`}>{rec.name}</h3>
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{rec.frequency.toUpperCase()}</span>
                                {rec.isProjected && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">PROJECTED</span>}
                                {!rec.isActive && <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">INACTIVE</span>}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">Starts: {formatDate(rec.startDate)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xl font-bold ${rec.isActive ? 'text-red-600' : 'text-gray-500'}`}>{formatCurrency(rec.amount)}</span>
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
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-slate-100">Recurring Income</h2>
                    <button
                      onClick={() => setShowAddRecurringIncome(!showAddRecurringIncome)}
                      className="flex items-center gap-2 bg-blue-600/20 backdrop-blur-sm text-blue-100 px-4 py-2 rounded-xl hover:bg-blue-600/30 transition-all border border-blue-500/30"
                    >
                      <Plus className="w-4 h-4" />
                      Add Recurring Income
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
    list="income-names"
    className="w-full px-3 py-2 border border-gray-300 rounded"
  />
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
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={`font-semibold ${rec.isActive ? 'text-gray-800' : 'text-gray-500'}`}>{rec.name}</h3>
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{rec.frequency.toUpperCase()}</span>
                                {!rec.isActive && <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">INACTIVE</span>}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">Starts: {formatDate(rec.startDate)} • To: {accounts.find(a => a.id === rec.accountId)?.name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xl font-bold ${rec.isActive ? 'text-green-600' : 'text-gray-500'}`}>{formatCurrency(rec.amount)}</span>
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
                <div className="flex items-center justify-between bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50">
                  <button
                    onClick={() => {
                      const newDate = new Date(calendarDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setCalendarDate(newDate);
                    }}
                    className="px-4 py-2 bg-blue-600/20 text-blue-100 rounded-xl hover:bg-blue-600/30 transition-all border border-blue-500/30"
                  >
                    ← Previous
                  </button>
                  <h2 className="text-2xl font-bold text-slate-100">
                    {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={() => {
                      const newDate = new Date(calendarDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setCalendarDate(newDate);
                    }}
                    className="px-4 py-2 bg-blue-600/20 text-blue-100 rounded-xl hover:bg-blue-600/30 transition-all border border-blue-500/30"
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

                          return (
                            <div
                              key={idx}
                              onClick={() => setSelectedCalendarDay(day)}
                              className={`aspect-square border rounded-xl p-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-blue-400 bg-blue-500/20 ring-2 ring-blue-400/50'
                                  : isToday 
                                  ? 'border-blue-500 bg-blue-500/10 hover:bg-blue-500/20' 
                                  : 'border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 hover:border-slate-600'
                              }`}
                            >
                              <div className={`text-sm font-semibold mb-1 ${isSelected ? 'text-blue-300' : isToday ? 'text-blue-300' : 'text-slate-300'}`}>
                                {day}
                              </div>
                              <div className="space-y-1 overflow-y-auto max-h-20">
                                {dayIncome.map((inc, i) => (
                                  <div
                                    key={`inc-${i}`}
                                    className="text-xs px-1 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 truncate"
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
                                      className={`text-xs px-1 py-0.5 rounded border truncate ${
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
            )}
      </div>
    )}

    {/* Projections content */}
    {planningSubTab === 'projections' && (
      <div className="space-y-6">
              <div className="space-y-6">
                <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50">
  <h3 className="text-sm font-semibold text-slate-300 mb-3">Period Filter</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div>
      <label className="block text-xs text-slate-400 mb-1">Start Date</label>
      <input
        type="date"
        value={projectionsDateRange.startDate}
        onChange={(e) => setprojectionsDateRange({ ...projectionsDateRange, startDate: e.target.value })}
        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-xs text-slate-400 mb-1">End Date</label>
      <input
        type="date"
        value={projectionsDateRange.endDate}
        onChange={(e) => setprojectionsDateRange({ ...projectionsDateRange, endDate: e.target.value })}
        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
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
                        <div key={idx} className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                          event.type === 'income' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-800">{event.name}</h3>
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
            )}
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
      
      // Track unique months that have actual payment data
      const monthsWithData = new Set();
      
      // Group expenses by name and calculate totals
const expenseGroups = {};

// Process all expenses in the date range
allExpenses.forEach(exp => {
  const expDueDate = new Date(exp.dateDue);
  const isInRange = expDueDate >= startDate;
  const isActualized = !exp.isProjected;
  
  if (!expenseGroups[exp.name]) {
    expenseGroups[exp.name] = {
      name: exp.name,
      total: 0,
      projected: 0,
      count: 0,
      isRecurring: !!exp.recurringId
    };
  }
  
  // Track actualized expenses
  if (isInRange && isActualized) {
    const monthKey = `${expDueDate.getFullYear()}-${expDueDate.getMonth()}`;
    monthsWithData.add(monthKey);
    
    expenseGroups[exp.name].total += exp.amount;
    expenseGroups[exp.name].count += 1;
  }
  
  // Track projected expenses
  if (isInRange && exp.isProjected) {
    expenseGroups[exp.name].projected += exp.amount;
  }
});
      
      // Calculate actual months with data for averaging (MUST be after the loop above)
      const actualMonthsWithData = Math.max(1, monthsWithData.size);
      
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
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedExpenses(sortedExpenses.map(e => e.name))}
          className="text-xs px-3 py-1.5 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all font-medium"
        >
          Select All
        </button>
        <button
          onClick={() => setSelectedExpenses([])}
          className="text-xs px-3 py-1.5 bg-slate-700/30 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-all font-medium"
        >
          Show All
        </button>
      </div>
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
                <p className="text-slate-400 text-sm mb-2">Total Spent</p>
                <p className="text-3xl font-bold text-blue-400">{formatCurrency(grandTotal)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Average per Month</p>
                <p className="text-3xl font-bold text-purple-400">{formatCurrency(grandTotal / actualMonthsWithData)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-2">Unique Expenses</p>
                <p className="text-3xl font-bold text-emerald-400">{sortedExpenses.length}</p>
              </div>
            </div>
          </div>

          {/* Expense Breakdown Table */}
          {filteredExpenses.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
               <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-gray-700">
  <div>Expense</div>
  <div className="text-right">Total Paid</div>
  <div className="text-right">Avg/Month</div>
  <div className="text-right">Avg Projected/Mo</div>
  <div className="text-right">% of Total</div>
</div>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredExpenses.map((exp, idx) => {
                  const avgPerMonth = exp.total / actualMonthsWithData;
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
                      <div className="text-right font-bold text-gray-800 flex items-center justify-end">
                        {formatCurrency(exp.total)}
                      </div>
                      <div className="text-right font-semibold text-blue-600 flex items-center justify-end">
  {formatCurrency(avgPerMonth)}
</div>
<div className="text-right font-semibold text-yellow-600 flex items-center justify-end">
  {formatCurrency(exp.projected / actualMonthsWithData)}
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

            {activeTab === 'first time here?' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/20">
                  <h2 className="text-3xl font-bold text-slate-100 mb-4 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                    Getting Started with FlowTrack
                  </h2>
                  <p className="text-slate-300 text-lg mb-3">Follow these steps to master your cashflow from paycheck to paycheck</p>
                  <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-4 mt-4">
                    <p className="text-emerald-200 text-sm">
                      <strong className="text-emerald-300">✓ Auto-Save Enabled:</strong> Your data is automatically saved as you work. 
                      You can close this tab anytime and come back - your data will be right here waiting for you!
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                        <span className="text-xl font-bold text-blue-300">1</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Set Up Your Accounts</h3>
                        <p className="text-slate-300 mb-4">Start by adding all your cash accounts (checking, savings, etc.) in the <strong className="text-blue-400">Accounts</strong> tab.</p>
                        <ul className="space-y-2 text-slate-400">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>Enter the current balance for each account as of today</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>The date field helps you track when you recorded this balance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>You can edit or delete accounts anytime</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                        <span className="text-xl font-bold text-purple-300">2</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Add Recurring Cash Items First</h3>
                        <p className="text-slate-300 mb-4">Go to the <strong className="text-purple-400">Recurring</strong> tab to set up your regular expenses and income.</p>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                            <h4 className="font-semibold text-rose-300 mb-2">Recurring Cash Expenses</h4>
                            <p className="text-sm text-slate-400 mb-2">Add bills that repeat regularly:</p>
                            <ul className="text-sm text-slate-400 space-y-1">
                              <li>• Rent/Mortgage</li>
                              <li>• Utilities (weekly, monthly, etc.)</li>
                              <li>• Credit Card Payments</li>
                              <li>• Car Payments</li>
                            </ul>
                          </div>
                          <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                            <h4 className="font-semibold text-emerald-300 mb-2">Recurring Income</h4>
                            <p className="text-sm text-slate-400 mb-2">Add income that repeats:</p>
                            <ul className="text-sm text-slate-400 space-y-1">
                              <li>• Salary/Paycheck</li>
                              <li>• Freelance contracts</li>
                              <li>• Rental income</li>
                              <li>• Any regular deposits</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                          <p className="text-sm text-slate-300"><strong className="text-blue-300">Tip:</strong> Recurring items automatically generate instances on the calendar. You can pause them anytime without deleting the recurring rule!</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                        <span className="text-xl font-bold text-amber-300">3</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Add One-Time Items</h3>
                        <p className="text-slate-300 mb-4">Use the <strong className="text-rose-400">Expenses</strong> and <strong className="text-emerald-400">Income</strong> tabs for non-recurring items.</p>
                        <ul className="space-y-2 text-slate-400">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-400 mt-1">•</span>
                            <span>One-time purchases, medical bills, tax refunds, bonuses, etc.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-400 mt-1">•</span>
                            <span>Mark expenses as "Projected" if you're not sure of the exact amount yet</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-400 mt-1">•</span>
                            <span>When you know the final amount, click "Actualize" to convert it to a confirmed expense</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                        <span className="text-xl font-bold text-emerald-300">4</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Track Payments</h3>
                        <p className="text-slate-300 mb-4">As you pay expenses, record them in the <strong className="text-rose-400">Expenses</strong> tab.</p>
                        <ul className="space-y-2 text-slate-400">
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span>
                            <span>Click "+ Add Payment" on any expense to record which account you paid from</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span>
                            <span>You can make partial payments - the system tracks remaining balance automatically</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span>
                            <span>Fully paid expenses show with a green checkmark</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span>
                            <span>Your Current Rolling Balance updates automatically as you track payments</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                        <span className="text-xl font-bold text-cyan-300">5</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Use the Overview & Calendar</h3>
                        <p className="text-slate-300 mb-4">Get a clear picture of your finances at a glance.</p>
                        <div className="space-y-3">
                          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                            <h4 className="font-semibold text-blue-300 mb-2">Overview Tab</h4>
                            <ul className="text-sm text-slate-400 space-y-1">
                              <li>• See your starting balance, current balance, and what's left to pay</li>
                              <li>• Adjust the period filter to focus on specific date ranges</li>
                              <li>• Track total income and expenses for any time period</li>
                            </ul>
                          </div>
                          <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                            <h4 className="font-semibold text-purple-300 mb-2">Calendar Tab</h4>
                            <ul className="text-sm text-slate-400 space-y-1">
                              <li>• Visualize when income arrives and expenses are due</li>
                              <li>• Click any date to see detailed breakdown of that day</li>
                              <li>• Green = income, Red = unpaid expenses, Gray = paid expenses</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                        <span className="text-xl font-bold text-indigo-300">6</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-100 mb-3">Plan with Projections</h3>
                        <p className="text-slate-300 mb-4">The <strong className="text-indigo-400">Projections</strong> tab shows your financial future.</p>
                        <ul className="space-y-2 text-slate-400">
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span><strong className="text-slate-300">Current Balance:</strong> Your money right now (after paid expenses)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span><strong className="text-slate-300">Projected End Balance:</strong> Where you'll be after all expected income and unpaid expenses</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span><strong className="text-slate-300">Cashflow Timeline:</strong> See day-by-day how your balance changes with each transaction</span>
                          </li>
                        </ul>
                        <div className="mt-4 bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                          <p className="text-sm text-slate-300"><strong className="text-indigo-300">Pro Tip:</strong> Adjust the period filter to see different timeframes. Set it to your next payday to see if you can cover all expenses until then!</p>
                        </div>
                      </div>
                    </div>
                  </div>

                 <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-sm p-6 rounded-2xl border border-emerald-500/20">
  <h3 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
    <Wallet className="w-6 h-6 text-emerald-400" />
    Cloud Sync & Data Security
  </h3>
  <div className="space-y-3 text-slate-300">
    <p><strong className="text-emerald-400">Auto-Save:</strong> Your data is automatically saved to the cloud as you make changes. Look for the "Last saved" timestamp in the header!</p>
    <p><strong className="text-blue-400">Multi-Device Access:</strong> Sign in from any device to access your data. Your information syncs automatically across all your devices.</p>
    <p><strong className="text-purple-400">Private & Secure:</strong> All your financial data is encrypted and stored securely in the cloud, accessible only with your account credentials.</p>
    <p><strong className="text-cyan-400">Always Backed Up:</strong> Your data is safely stored in the cloud, so you never have to worry about losing it if something happens to your device.</p>
  </div>
</div>

                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 text-center">
                    <h3 className="text-2xl font-bold text-slate-100 mb-3">You're All Set! 🎉</h3>
                    <p className="text-slate-300 text-lg">Start with the Accounts tab and work your way through. Within 15 minutes, you'll have complete visibility into your cashflow.</p>
                  </div>
                </div>
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

  if (!user) {
    return <Auth user={user} />;
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Auth user={user} />
      </div>
      <CashflowTracker userId={user.uid} />
    </>
  );
}