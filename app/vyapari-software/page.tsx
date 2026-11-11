'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  BookOpen,
  Plus,
  Trash2,
  Printer,
  MessageCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  UserPlus,
  LogIn,
  Lock,
  Phone,
  Store,
  User,
  LogOut,
  Crown,
  X,
  FileText,
  Sun,
  Moon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrandLogo } from '@/components/BrandLogo';
import { LanguageSwitcher } from '@/components/landing/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { VYAPARI_SW_TEXT } from '@/lib/vyapari-software-i18n';
import {
  printPukkaBill,
  printKhataStatement,
  buildWhatsAppPukkaBillUrl,
  buildWhatsAppKhataReminderUrl,
} from '@/lib/vyapari-print-whatsapp';
import { cn } from '@/lib/utils';

interface SoftwareUser {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  password?: string;
  isPaidPro?: boolean;
  planType?: string;
  paymentStatus?: 'paid' | 'pending' | 'unpaid' | string;
  paymentAmount?: number;
  paymentReference?: string;
  expiresAt?: string | null;
}

interface BillItem {
  name: string;
  qty: number;
  price: number;
}

interface SavedBill {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  isGst: boolean;
  gstRate: number;
  items: BillItem[];
  subtotal: number;
  discount: number;
  gstAmount: number;
  grandTotal: number;
  status: 'paid' | 'unpaid';
  createdAt: string;
}

interface KhataCustomer {
  id: string;
  name: string;
  phone: string;
  entries: Array<{
    id: string;
    type: 'gave' | 'got';
    amount: number;
    note: string;
    date: string;
  }>;
}

const USERS_MAP_KEY = 'bb_sw_users_directory_v2';
const ACTIVE_PHONE_KEY = 'bb_sw_active_phone_v2';
const FREE_BILL_LIMIT = 3;

function getBillsKey(phone: string) {
  return `bb_sw_bills_user_${phone}`;
}

function getKhataKey(phone: string) {
  return `bb_sw_khata_user_${phone}`;
}

function VyapariSoftwareContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'register';
  const initialTool = searchParams.get('tool') === 'khata' ? 'khata' : 'billing';

  const { language } = useLanguage();
  const { mode, toggle } = useTheme();
  const txt = VYAPARI_SW_TEXT[language] || VYAPARI_SW_TEXT.hinglish;

  const [authStep, setAuthStep] = useState<'register' | 'login' | 'unlocked'>(initialMode);
  const [activeSoftware, setActiveSoftware] = useState<'billing' | 'khata'>(initialTool);
  const [currentUser, setCurrentUser] = useState<SoftwareUser | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Register Form
  const [regShopName, setRegShopName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Login Form
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  // Per-User Billing State
  const [savedBills, setSavedBills] = useState<SavedBill[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isGstBill, setIsGstBill] = useState(false);
  const [gstRate, setGstRate] = useState(18);
  const [discount, setDiscount] = useState<number>(0);
  const [billStatus, setBillStatus] = useState<'paid' | 'unpaid'>('paid');
  const [billItems, setBillItems] = useState<BillItem[]>([
    { name: '', qty: 1, price: 0 },
  ]);

  // Per-User Khata State
  const [khataCustomers, setKhataCustomers] = useState<KhataCustomer[]>([]);
  const [activeCustomerId, setActiveCustomerId] = useState<string>('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [entryAmt, setEntryAmt] = useState('');
  const [entryDesc, setEntryDesc] = useState('');

  // Load user session if already logged in, unless user explicitly clicked ?mode=register or ?mode=login
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const toolParam = searchParams.get('tool');
    if (toolParam === 'khata' || toolParam === 'billing') {
      setActiveSoftware(toolParam);
    }

    try {
      const activePhone = localStorage.getItem(ACTIVE_PHONE_KEY);
      const usersRaw = localStorage.getItem(USERS_MAP_KEY);
      const usersMap: Record<string, SoftwareUser> = usersRaw ? JSON.parse(usersRaw) : {};

      if (activePhone && usersMap[activePhone] && !modeParam) {
        loadUserWorkspace(usersMap[activePhone]);
      } else if (modeParam === 'login' || modeParam === 'register') {
        setAuthStep(modeParam);
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  // Load ONLY the logged-in user's personal bills & khata
  const loadUserWorkspace = async (user: SoftwareUser) => {
    setCurrentUser(user);
    setAuthStep('unlocked');

    // 1. Load from per-user localStorage immediately
    try {
      const localBills = localStorage.getItem(getBillsKey(user.phone));
      const parsedBills: SavedBill[] = localBills ? JSON.parse(localBills) : [];
      setSavedBills(parsedBills);

      const localKhata = localStorage.getItem(getKhataKey(user.phone));
      const parsedKhata: KhataCustomer[] = localKhata ? JSON.parse(localKhata) : [];
      setKhataCustomers(parsedKhata);
      if (parsedKhata.length > 0) setActiveCustomerId(parsedKhata[0].id);
    } catch {
      setSavedBills([]);
      setKhataCustomers([]);
    }

    // 2. Also sync from MySQL API if available
    if (user.id && !user.id.startsWith('local-')) {
      try {
        const res = await fetch(`/api/vyapari-software?userId=${encodeURIComponent(user.id)}`);
        const json = await res.json();
        if (json?.success && json.data) {
          if (json.data.user) {
            const freshUser: SoftwareUser = {
              ...user,
              ...json.data.user,
              isPaidPro: Boolean(json.data.user.isPaidPro || json.data.user.paymentStatus === 'paid'),
            };
            setCurrentUser(freshUser);
            const usersRaw = localStorage.getItem(USERS_MAP_KEY);
            const usersMap = usersRaw ? JSON.parse(usersRaw) : {};
            usersMap[user.phone] = freshUser;
            localStorage.setItem(USERS_MAP_KEY, JSON.stringify(usersMap));
          }
          if (Array.isArray(json.data.bills)) {
            setSavedBills(json.data.bills);
            localStorage.setItem(getBillsKey(user.phone), JSON.stringify(json.data.bills));
          }
          if (Array.isArray(json.data.khata)) {
            const formattedKhata = json.data.khata.map((k: any) => ({
              id: k.id,
              name: k.customerName,
              phone: k.customerPhone,
              entries: k.entries || [],
            }));
            setKhataCustomers(formattedKhata);
            if (formattedKhata.length > 0) setActiveCustomerId(formattedKhata[0].id);
            localStorage.setItem(getKhataKey(user.phone), JSON.stringify(formattedKhata));
          }
        }
      } catch {
        // local storage already loaded
      }
    }
  };

  const isPaidUser = Boolean(currentUser?.isPaidPro || currentUser?.paymentStatus === 'paid');
  const billsUsed = savedBills.length;
  const isLimitReached = !isPaidUser && billsUsed >= FREE_BILL_LIMIT;

  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!utrNumber.trim()) {
      toast.error('Please enter UPI Ref / UTR / Transaction ID');
      return;
    }

    setIsSubmittingProof(true);
    try {
      if (currentUser.id && !currentUser.id.startsWith('local-')) {
        const res = await fetch('/api/vyapari-software', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'submit_payment_request',
            userId: currentUser.id,
            planType: selectedPlan,
            paymentReference: utrNumber.trim(),
            paymentAmount: selectedPlan === 'yearly' ? 999 : 199,
          }),
        });
        const json = await res.json();
        if (!json?.success) {
          toast.error(json?.message || 'Failed to submit proof');
          return;
        }
      }

      const updated: SoftwareUser = {
        ...currentUser,
        paymentStatus: 'pending',
        planType: selectedPlan,
        paymentReference: utrNumber.trim(),
        paymentAmount: selectedPlan === 'yearly' ? 999 : 199,
      };
      setCurrentUser(updated);

      const usersRaw = localStorage.getItem(USERS_MAP_KEY);
      const usersMap = usersRaw ? JSON.parse(usersRaw) : {};
      usersMap[currentUser.phone] = updated;
      localStorage.setItem(USERS_MAP_KEY, JSON.stringify(usersMap));

      toast.success('Payment proof submitted! Admin will verify and activate your Unlimited Pro account.');
      setShowPaymentModal(false);
      setUtrNumber('');
    } catch {
      toast.error('Could not submit payment proof');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // ==================== STEP 1: REGISTER ====================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = regPhone.replace(/\D/g, '').slice(-10);
    if (!regShopName.trim() || !regOwnerName.trim() || cleanPhone.length < 10 || !regPassword.trim()) {
      toast.error('Please fill Shop Name, Owner Name, 10-digit Mobile & Password');
      return;
    }

    setIsSubmittingAuth(true);
    try {
      let createdUser: SoftwareUser = {
        id: `local-${cleanPhone}`,
        shopName: regShopName.trim(),
        ownerName: regOwnerName.trim(),
        phone: cleanPhone,
        password: regPassword.trim(),
        isPaidPro: false,
      };

      // Try saving in MySQL DB
      try {
        const res = await fetch('/api/vyapari-software', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            shopName: regShopName.trim(),
            ownerName: regOwnerName.trim(),
            phone: cleanPhone,
            password: regPassword.trim(),
          }),
        });
        const json = await res.json();
        if (json?.success && json.data) {
          createdUser = { ...createdUser, id: json.data.id };
        }
      } catch {
        // Fallback to per-phone local directory
      }

      // Save user in per-phone directory so each mobile number has its own account
      const usersRaw = localStorage.getItem(USERS_MAP_KEY);
      const usersMap: Record<string, SoftwareUser> = usersRaw ? JSON.parse(usersRaw) : {};
      usersMap[cleanPhone] = createdUser;
      localStorage.setItem(USERS_MAP_KEY, JSON.stringify(usersMap));

      setLoginPhone(cleanPhone);
      setLoginPassword('');
      setAuthStep('login');
      toast.success('Registration Successful! Now Login with your Mobile No. & Password.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // ==================== STEP 2: LOGIN ====================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = loginPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10 || !loginPassword.trim()) {
      toast.error('Enter your 10-digit Mobile Number & Password');
      return;
    }

    setIsSubmittingAuth(true);
    try {
      // 1. Check MySQL API first
      try {
        const res = await fetch('/api/vyapari-software', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            phone: cleanPhone,
            password: loginPassword.trim(),
          }),
        });
        const json = await res.json();
        if (res.ok && json?.success && json.data) {
          const loggedInUser: SoftwareUser = {
            ...json.data,
            password: loginPassword.trim(),
          };
          const usersRaw = localStorage.getItem(USERS_MAP_KEY);
          const usersMap: Record<string, SoftwareUser> = usersRaw ? JSON.parse(usersRaw) : {};
          usersMap[cleanPhone] = loggedInUser;
          localStorage.setItem(USERS_MAP_KEY, JSON.stringify(usersMap));
          localStorage.setItem(ACTIVE_PHONE_KEY, cleanPhone);

          await loadUserWorkspace(loggedInUser);
          toast.success(`Welcome ${loggedInUser.ownerName} (${loggedInUser.shopName})!`);
          return;
        }
      } catch {
        // check local directory below
      }

      // 2. Check per-phone local directory
      const usersRaw = localStorage.getItem(USERS_MAP_KEY);
      const usersMap: Record<string, SoftwareUser> = usersRaw ? JSON.parse(usersRaw) : {};
      const matched = usersMap[cleanPhone];

      if (matched && matched.password === loginPassword.trim()) {
        localStorage.setItem(ACTIVE_PHONE_KEY, cleanPhone);
        await loadUserWorkspace(matched);
        toast.success(`Welcome ${matched.ownerName} (${matched.shopName})!`);
      } else {
        toast.error('Invalid Mobile Number or Password! Please Register first if new.');
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ACTIVE_PHONE_KEY);
    setCurrentUser(null);
    setSavedBills([]);
    setKhataCustomers([]);
    setAuthStep('login');
    toast.success('Logged out');
  };

  // ==================== BILLING LOGIC ====================
  const subtotal = useMemo(
    () => billItems.reduce((sum, i) => sum + Number(i.qty || 0) * Number(i.price || 0), 0),
    [billItems],
  );
  const taxable = useMemo(() => Math.max(0, subtotal - Number(discount || 0)), [subtotal, discount]);
  const gstAmount = useMemo(
    () => (isGstBill ? Number(((taxable * gstRate) / 100).toFixed(2)) : 0),
    [isGstBill, taxable, gstRate],
  );
  const grandTotal = useMemo(() => Number((taxable + gstAmount).toFixed(2)), [taxable, gstAmount]);

  const addItemRow = () => {
    setBillItems((prev) => [...prev, { name: '', qty: 1, price: 0 }]);
  };

  const updateItemRow = (idx: number, key: keyof BillItem, val: string | number) => {
    setBillItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: val };
      return copy;
    });
  };

  const removeItemRow = (idx: number) => {
    if (billItems.length <= 1) return;
    setBillItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateAndSaveBill = async () => {
    if (!currentUser) return;

    if (isLimitReached) {
      setShowPaymentModal(true);
      toast.error(txt.limitOverBadge);
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please enter Customer Name');
      return;
    }
    const validItems = billItems.filter((i) => i.name.trim() && Number(i.price) > 0);
    if (validItems.length === 0) {
      toast.error('Please enter at least 1 item name and rate');
      return;
    }

    const invoiceNo = `BB-${1001 + savedBills.length}`;
    let newBill: SavedBill = {
      id: `bill-${Date.now()}`,
      invoiceNo,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      isGst: isGstBill,
      gstRate,
      items: validItems,
      subtotal,
      discount,
      gstAmount,
      grandTotal,
      status: billStatus,
      createdAt: new Date().toISOString(),
    };

    // Save to DB if connected
    if (currentUser.id && !currentUser.id.startsWith('local-')) {
      try {
        const res = await fetch('/api/vyapari-software', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_bill',
            userId: currentUser.id,
            ...newBill,
          }),
        });
        if (res.status === 402) {
          setShowPaymentModal(true);
          return;
        }
        const json = await res.json();
        if (json?.success && json.data) {
          newBill = json.data;
        }
      } catch {
        // local save below
      }
    }

    const updatedBills = [newBill, ...savedBills];
    setSavedBills(updatedBills);
    localStorage.setItem(getBillsKey(currentUser.phone), JSON.stringify(updatedBills));

    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setBillItems([{ name: '', qty: 1, price: 0 }]);

    if (updatedBills.length >= FREE_BILL_LIMIT && !currentUser.isPaidPro) {
      toast.success(txt.paywallTitle);
      setTimeout(() => setShowPaymentModal(true), 450);
    } else {
      toast.success(`Bill #${newBill.invoiceNo} Saved! (${updatedBills.length}/${FREE_BILL_LIMIT} Free)`);
    }
  };

  const toggleSavedBillStatus = async (bill: SavedBill) => {
    if (!currentUser) return;
    const nextStatus = bill.status === 'paid' ? 'unpaid' : 'paid';
    const updated = savedBills.map((b) =>
      b.id === bill.id ? { ...b, status: nextStatus as 'paid' | 'unpaid' } : b,
    );
    setSavedBills(updated);
    localStorage.setItem(getBillsKey(currentUser.phone), JSON.stringify(updated));

    if (currentUser.id && !currentUser.id.startsWith('local-')) {
      fetch('/api/vyapari-software', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_bill_status',
          userId: currentUser.id,
          billId: bill.id,
          status: nextStatus,
        }),
      }).catch(() => {});
    }
  };

  const buildWhatsAppBillHref = (bill: {
    invoiceNo: string;
    customerName: string;
    customerPhone: string;
    items: BillItem[];
    subtotal: number;
    discount: number;
    isGst: boolean;
    gstRate: number;
    gstAmount: number;
    grandTotal: number;
    status: string;
    createdAt?: string;
  }) => {
    return buildWhatsAppPukkaBillUrl({
      shopName: currentUser?.shopName || 'Bhartiyebazar Store',
      ownerName: currentUser?.ownerName,
      shopPhone: currentUser?.phone,
      invoiceNo: bill.invoiceNo,
      customerName: bill.customerName || 'Walk-in Customer',
      customerPhone: bill.customerPhone,
      isGst: bill.isGst,
      gstRate: bill.gstRate,
      items: bill.items,
      subtotal: bill.subtotal,
      discount: bill.discount,
      gstAmount: bill.gstAmount,
      grandTotal: bill.grandTotal,
      status: bill.status,
      createdAt: bill.createdAt,
    });
  };

  const handlePrintLiveBill = () => {
    printPukkaBill({
      shopName: currentUser?.shopName || 'Bhartiyebazar Store',
      ownerName: currentUser?.ownerName,
      shopPhone: currentUser?.phone,
      invoiceNo: `BB-${1001 + savedBills.length}`,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      isGst: isGstBill,
      gstRate,
      items: billItems,
      subtotal,
      discount,
      gstAmount,
      grandTotal,
      status: billStatus,
    });
  };

  const handlePrintSavedBill = (bill: SavedBill) => {
    printPukkaBill({
      shopName: currentUser?.shopName || 'Bhartiyebazar Store',
      ownerName: currentUser?.ownerName,
      shopPhone: currentUser?.phone,
      invoiceNo: bill.invoiceNo,
      customerName: bill.customerName,
      customerPhone: bill.customerPhone,
      isGst: bill.isGst,
      gstRate: bill.gstRate,
      items: bill.items,
      subtotal: bill.subtotal,
      discount: bill.discount,
      gstAmount: bill.gstAmount,
      grandTotal: bill.grandTotal,
      status: bill.status,
      createdAt: bill.createdAt,
    });
  };

  const liveWhatsAppHref = useMemo(
    () =>
      buildWhatsAppPukkaBillUrl({
        shopName: currentUser?.shopName || 'Bhartiyebazar Store',
        ownerName: currentUser?.ownerName,
        shopPhone: currentUser?.phone,
        invoiceNo: `BB-${1001 + savedBills.length}`,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim(),
        isGst: isGstBill,
        gstRate,
        items: billItems,
        subtotal,
        discount,
        gstAmount,
        grandTotal,
        status: billStatus,
      }),
    [
      currentUser,
      savedBills.length,
      customerName,
      customerPhone,
      isGstBill,
      gstRate,
      billItems,
      subtotal,
      discount,
      gstAmount,
      grandTotal,
      billStatus,
    ],
  );

  // ==================== KHATA LOGIC ====================
  const activeCustomer =
    khataCustomers.find((c) => c.id === activeCustomerId) || khataCustomers[0] || null;

  const getCustomerNet = (c: KhataCustomer) =>
    c.entries.reduce((acc, e) => (e.type === 'gave' ? acc + e.amount : acc - e.amount), 0);

  const { totalLena, totalDena } = useMemo(() => {
    let lena = 0;
    let dena = 0;
    khataCustomers.forEach((c) => {
      const net = getCustomerNet(c);
      if (net > 0) lena += net;
      if (net < 0) dena += Math.abs(net);
    });
    return { totalLena: lena, totalDena: dena };
  }, [khataCustomers]);

  const handleAddKhataCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (isLimitReached) {
      setShowPaymentModal(true);
      return;
    }
    if (!newCustName.trim()) {
      toast.error('Enter Customer Name');
      return;
    }
    const newCust: KhataCustomer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      entries: [],
    };
    const updated = [newCust, ...khataCustomers];
    setKhataCustomers(updated);
    setActiveCustomerId(newCust.id);
    localStorage.setItem(getKhataKey(currentUser.phone), JSON.stringify(updated));
    setNewCustName('');
    setNewCustPhone('');

    if (currentUser.id && !currentUser.id.startsWith('local-')) {
      fetch('/api/vyapari-software', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_khata_customer',
          userId: currentUser.id,
          customer: newCust,
        }),
      }).catch(() => {});
    }
    toast.success('Customer added to your Bahi-Khata!');
  };

  const handleAddKhataEntry = (type: 'gave' | 'got') => {
    if (!currentUser || !activeCustomer) return;
    if (isLimitReached) {
      setShowPaymentModal(true);
      return;
    }
    const amount = Number(entryAmt);
    if (!amount || amount <= 0) {
      toast.error('Enter valid amount (₹)');
      return;
    }

    const updatedCustomer: KhataCustomer = {
      ...activeCustomer,
      entries: [
        {
          id: `e-${Date.now()}`,
          type,
          amount,
          note:
            entryDesc.trim() ||
            (type === 'gave' ? 'Saman Udhaar Diya' : 'Cash / UPI Jama Mila'),
          date: new Date().toLocaleDateString('en-IN'),
        },
        ...activeCustomer.entries,
      ],
    };

    const updatedList = khataCustomers.map((c) =>
      c.id === activeCustomer.id ? updatedCustomer : c,
    );
    setKhataCustomers(updatedList);
    localStorage.setItem(getKhataKey(currentUser.phone), JSON.stringify(updatedList));
    setEntryAmt('');
    setEntryDesc('');

    if (currentUser.id && !currentUser.id.startsWith('local-')) {
      fetch('/api/vyapari-software', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_khata_customer',
          userId: currentUser.id,
          customer: updatedCustomer,
        }),
      }).catch(() => {});
    }
    toast.success('Khata entry saved!');
  };

  const activeNetBalance = activeCustomer ? getCustomerNet(activeCustomer) : 0;
  const khataReminderUrl = useMemo(() => {
    if (!activeCustomer) return '#';
    return buildWhatsAppKhataReminderUrl({
      shopName: currentUser?.shopName || 'Bhartiyebazar Store',
      shopPhone: currentUser?.phone,
      customerName: activeCustomer.name,
      customerPhone: activeCustomer.phone,
      netBalance: activeNetBalance,
      entries: activeCustomer.entries || [],
    });
  }, [activeCustomer, activeNetBalance, currentUser]);

  const handlePrintActiveKhata = () => {
    if (!activeCustomer) return;
    printKhataStatement({
      shopName: currentUser?.shopName || 'Bhartiyebazar Store',
      shopPhone: currentUser?.phone,
      customerName: activeCustomer.name,
      customerPhone: activeCustomer.phone,
      netBalance: activeNetBalance,
      entries: activeCustomer.entries || [],
    });
  };

  const paymentWhatsAppUrl = useMemo(() => {
    const planText =
      selectedPlan === 'monthly'
        ? 'Monthly Unlimited Software Plan (₹199/Month)'
        : 'Yearly Unlimited Software Plan (₹999/Year)';
    const msg = `Namaste Bhartiyebazar Team! Mere 3 Free Bills poore ho gaye hain.\n\n🏪 Shop: *${currentUser?.shopName || 'My Shop'}*\n👤 Name: *${currentUser?.ownerName || 'Merchant'}*\n📱 Mobile: *${currentUser?.phone || ''}*\n💳 Selected Plan: *${planText}*\n\nKripya mera Unlimited Billing & Bahi-Khata Software activate karein.`;
    return `https://wa.me/916397650818?text=${encodeURIComponent(msg)}`;
  }, [selectedPlan, currentUser]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Top Standalone Software Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo imageClassName="h-9" textClassName="text-lg" />
            <span className="hidden sm:inline-block rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-3 py-0.5 text-xs font-extrabold">
              {txt.portalTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer"
              aria-label="Toggle theme"
            >
              {mode === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </button>
            <Link
              href="/"
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {txt.backHome}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {authStep !== 'unlocked' || !currentUser ? (
          /* ==================== REGISTER / LOGIN SCREEN ==================== */
          <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-12 items-center">
            {/* Left Visual Preview */}
            <div className="md:col-span-6 space-y-4">
              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    activeSoftware === 'khata'
                      ? '/khata-software-preview.jpg'
                      : '/billing-software-preview.jpg'
                  }
                  alt="Software Preview"
                  className="w-full aspect-16/9 object-cover"
                />
                <div className="p-5">
                  <span className="inline-block rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-3 py-0.5 text-[11px] font-black uppercase">
                    {activeSoftware === 'khata' ? txt.sw2Badge : txt.sw1Badge}
                  </span>
                  <h2 className="mt-2 text-xl font-black text-gray-900 dark:text-white">
                    {activeSoftware === 'khata' ? txt.sw2Title : txt.sw1Title}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {activeSoftware === 'khata' ? txt.sw2Short : txt.sw1Short}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Auth Box */}
            <div className="md:col-span-6 rounded-3xl border-2 border-indigo-600 bg-white dark:bg-gray-900 p-6 sm:p-7 shadow-xl">
              <div className="grid grid-cols-2 rounded-2xl bg-gray-100 dark:bg-gray-800 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setAuthStep('register')}
                  className={cn(
                    'py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer',
                    authStep === 'register'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400',
                  )}
                >
                  {txt.registerBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthStep('login')}
                  className={cn(
                    'py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer',
                    authStep === 'login'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400',
                  )}
                >
                  {txt.loginBtn}
                </button>
              </div>

              {authStep === 'register' ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {txt.step1Title}
                  </h3>

                  <div>
                    <Label className="text-xs font-bold">{txt.shopNameLbl}</Label>
                    <div className="relative mt-1">
                      <Store className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={regShopName}
                        onChange={(e) => setRegShopName(e.target.value)}
                        placeholder="e.g. Sharma Kirana Store"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-bold">{txt.ownerNameLbl}</Label>
                    <div className="relative mt-1">
                      <User className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={regOwnerName}
                        onChange={(e) => setRegOwnerName(e.target.value)}
                        placeholder="e.g. Rajesh Sharma"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-bold">{txt.mobileLbl}</Label>
                    <div className="relative mt-1">
                      <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-bold">{txt.passwordLbl}</Label>
                    <div className="mt-1">
                      <Input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg"
                  >
                    {txt.registerSubmit}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {txt.step2Title}
                  </h3>

                  <div>
                    <Label className="text-xs font-bold">{txt.mobileLbl}</Label>
                    <div className="relative mt-1">
                      <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-bold">{txt.passwordLbl}</Label>
                    <div className="mt-1">
                      <Input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    {txt.loginSubmit}
                  </Button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* ==================== PERSONALIZED MERCHANT WORKSPACE ==================== */
          <div className="space-y-6">
            {/* Merchant Personal Header Bar */}
            <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-gray-900 p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-xl">
                  {currentUser.shopName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                      {currentUser.shopName}
                    </h1>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-[11px] font-extrabold">
                      👤 {currentUser.ownerName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">WhatsApp: +91 {currentUser.phone}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {isPaidUser ? (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-3.5 py-2 text-xs font-black flex items-center gap-1.5 shadow-xs">
                    <Crown className="h-4 w-4 text-emerald-600" />
                    <span>👑 PRO ACTIVE &bull; Unlimited Bills</span>
                    {currentUser.expiresAt && (
                      <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                        (Exp: {new Date(currentUser.expiresAt).toLocaleDateString('en-IN')})
                      </span>
                    )}
                  </div>
                ) : currentUser.paymentStatus === 'pending' ? (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 px-3.5 py-2 text-xs font-black flex items-center gap-1.5 animate-pulse shadow-xs">
                    <span>⏳ Payment Verification Pending (Admin Approval Soon)</span>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'rounded-xl border px-3.5 py-2 text-xs font-extrabold flex items-center gap-2',
                      isLimitReached
                        ? 'border-rose-300 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        : 'border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300',
                    )}
                  >
                    <span>
                      {isLimitReached
                        ? txt.limitOverBadge
                        : `🎁 ${txt.freeTrialBadge} ${billsUsed} / ${FREE_BILL_LIMIT}`}
                    </span>
                  </div>
                )}

                {!isPaidUser && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setShowPaymentModal(true)}
                    className="rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-sm"
                  >
                    {txt.upgradeBtn}
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                  className="rounded-xl text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" /> {txt.logoutBtn}
                </Button>
              </div>
            </div>

            {/* Software Switcher Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveSoftware('billing')}
                className={cn(
                  'flex items-center justify-center gap-2.5 rounded-2xl py-3.5 px-5 text-sm sm:text-base font-black border transition-all cursor-pointer',
                  activeSoftware === 'billing'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800',
                )}
              >
                <Receipt className="h-5 w-5" />
                <span>{txt.sw1Title}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSoftware('khata')}
                className={cn(
                  'flex items-center justify-center gap-2.5 rounded-2xl py-3.5 px-5 text-sm sm:text-base font-black border transition-all cursor-pointer',
                  activeSoftware === 'khata'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800',
                )}
              >
                <BookOpen className="h-5 w-5" />
                <span>{txt.sw2Title}</span>
              </button>
            </div>

            {activeSoftware === 'billing' ? (
              /* ==================== BILLING WORKSPACE ==================== */
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-12 items-start">
                  {/* Left: Bill Form */}
                  <div className="lg:col-span-7 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-md space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                      <h2 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-indigo-600" />
                        {txt.newBillTitle} ({billsUsed}/{FREE_BILL_LIMIT})
                      </h2>
                      <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
                        <button
                          type="button"
                          onClick={() => setIsGstBill(false)}
                          className={cn(
                            'px-3 py-1 rounded-lg text-xs font-bold cursor-pointer',
                            !isGstBill
                              ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-2xs'
                              : 'text-gray-600 dark:text-gray-400',
                          )}
                        >
                          Non-GST
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsGstBill(true)}
                          className={cn(
                            'px-3 py-1 rounded-lg text-xs font-bold cursor-pointer',
                            isGstBill
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'text-gray-600 dark:text-gray-400',
                          )}
                        >
                          GST Bill
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-bold">{txt.custName}</Label>
                        <Input
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Amit Kumar"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-bold">{txt.custPhone}</Label>
                        <Input
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                          {txt.itemsTitle}
                        </Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={addItemRow}
                          className="h-8 text-xs font-bold"
                        >
                          {txt.addItem}
                        </Button>
                      </div>

                      {billItems.map((it, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-gray-800/60 p-2 rounded-xl border border-gray-200 dark:border-gray-700"
                        >
                          <div className="col-span-6">
                            <Input
                              value={it.name}
                              onChange={(e) => updateItemRow(idx, 'name', e.target.value)}
                              placeholder="Item Name"
                              className="h-9 text-xs sm:text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              min={1}
                              value={it.qty}
                              onChange={(e) => updateItemRow(idx, 'qty', Number(e.target.value))}
                              placeholder="Qty"
                              className="h-9 text-xs sm:text-sm text-center"
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              min={0}
                              value={it.price || ''}
                              onChange={(e) => updateItemRow(idx, 'price', Number(e.target.value))}
                              placeholder="Rate ₹"
                              className="h-9 text-xs sm:text-sm"
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeItemRow(idx)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <Label className="text-xs font-bold">{txt.discount}</Label>
                        <Input
                          type="number"
                          min={0}
                          value={discount || ''}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          placeholder="0"
                          className="mt-1 h-9"
                        />
                      </div>
                      {isGstBill && (
                        <div>
                          <Label className="text-xs font-bold">GST %</Label>
                          <select
                            value={gstRate}
                            onChange={(e) => setGstRate(Number(e.target.value))}
                            className="mt-1 w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 text-xs font-bold"
                          >
                            <option value={5}>5% GST</option>
                            <option value={12}>12% GST</option>
                            <option value={18}>18% GST</option>
                            <option value={28}>28% GST</option>
                          </select>
                        </div>
                      )}
                      <div>
                        <Label className="text-xs font-bold">{txt.status}</Label>
                        <select
                          value={billStatus}
                          onChange={(e) => setBillStatus(e.target.value as 'paid' | 'unpaid')}
                          className="mt-1 w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 text-xs font-bold"
                        >
                          <option value="paid">✅ PAID</option>
                          <option value="unpaid">⏳ UNPAID</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5 pt-2">
                      <Button
                        type="button"
                        onClick={handleCreateAndSaveBill}
                        className="flex-1 min-w-[180px] h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md"
                      >
                        {isLimitReached ? txt.limitOverBadge : `${txt.saveBill} (${billsUsed}/${FREE_BILL_LIMIT})`}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrintLiveBill}
                        className="h-11 rounded-xl font-bold text-xs border-indigo-200 dark:border-indigo-800"
                      >
                        <Printer className="h-4 w-4 mr-1.5 text-indigo-600" />
                        {txt.printPdf}
                      </Button>

                      <Button
                        asChild
                        className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                      >
                        <a href={liveWhatsAppHref} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4 mr-1.5" />
                          {txt.waShare}
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Right: Live Printable Invoice */}
                  <div className="lg:col-span-5 rounded-3xl border-2 border-indigo-200 dark:border-indigo-900 bg-white text-gray-900 p-5 sm:p-6 shadow-xl">
                    <div className="flex items-start justify-between border-b-2 border-dashed border-gray-300 pb-3">
                      <div>
                        <span className="inline-block rounded bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[10px] font-black uppercase">
                          {isGstBill ? 'GST TAX INVOICE' : 'RETAIL CASH BILL'}
                        </span>
                        <h4 className="text-lg font-black text-gray-900 mt-1">
                          {currentUser.shopName}
                        </h4>
                        <p className="text-[11px] text-gray-500">Ph: +91 {currentUser.phone}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Customer: <strong className="text-gray-900">{customerName || 'Walk-in'}</strong>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-indigo-700">
                          #BB-{1001 + savedBills.length}
                        </div>
                        <span
                          className={cn(
                            'mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase',
                            billStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800',
                          )}
                        >
                          {billStatus === 'paid' ? '✓ PAID' : '⏳ UNPAID'}
                        </span>
                      </div>
                    </div>

                    <table className="w-full text-xs my-3">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px]">
                          <th className="py-1.5 text-left">Item</th>
                          <th className="py-1.5 text-center">Qty</th>
                          <th className="py-1.5 text-right">Rate</th>
                          <th className="py-1.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {billItems.map((it, i) => (
                          <tr key={i}>
                            <td className="py-1.5 font-semibold text-gray-800">
                              {it.name || `Item ${i + 1}`}
                            </td>
                            <td className="py-1.5 text-center text-gray-600">{it.qty}</td>
                            <td className="py-1.5 text-right text-gray-600">₹{it.price}</td>
                            <td className="py-1.5 text-right font-bold text-gray-900">
                              ₹{Number(it.qty) * Number(it.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="border-t-2 border-dashed border-gray-300 pt-3 space-y-1 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-semibold">₹{subtotal}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Discount</span>
                          <span className="font-semibold">- ₹{discount}</span>
                        </div>
                      )}
                      {isGstBill && (
                        <div className="flex justify-between text-gray-600">
                          <span>GST ({gstRate}%)</span>
                          <span>+ ₹{gstAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-base font-black text-indigo-950">
                        <span>Grand Total</span>
                        <span className="text-lg text-indigo-700">
                          ₹{grandTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User's Personal Saved Bills Table */}
                <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-md">
                  <h3 className="font-black text-base text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    {txt.savedBillsTitle} ({savedBills.length})
                  </h3>
                  {savedBills.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">
                      No bills created yet for {currentUser.shopName}. Create your first free bill above!
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500 uppercase text-[11px]">
                            <th className="py-2 px-3">Bill No</th>
                            <th className="py-2 px-3">Customer</th>
                            <th className="py-2 px-3">Total</th>
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3 text-right">Print / WhatsApp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {savedBills.map((b) => (
                            <tr key={b.id}>
                              <td className="py-2.5 px-3 font-bold text-indigo-600">{b.invoiceNo}</td>
                              <td className="py-2.5 px-3 font-semibold">
                                {b.customerName} {b.customerPhone ? `(${b.customerPhone})` : ''}
                              </td>
                              <td className="py-2.5 px-3 font-black">
                                ₹{Number(b.grandTotal).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 px-3">
                                <button
                                  type="button"
                                  onClick={() => toggleSavedBillStatus(b)}
                                  className={cn(
                                    'rounded-full px-2.5 py-0.5 text-[11px] font-bold cursor-pointer',
                                    b.status === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800',
                                  )}
                                >
                                  {b.status === 'paid' ? '✓ Paid' : '⏳ Unpaid'}
                                </button>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="inline-flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handlePrintSavedBill(b)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 text-xs font-bold cursor-pointer"
                                  >
                                    <Printer className="h-3.5 w-3.5" /> Print / PDF
                                  </button>
                                  <a
                                    href={buildWhatsAppBillHref(b)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-xs font-bold"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Bill
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ==================== BAHI-KHATA WORKSPACE ==================== */
              <div className="grid gap-6 lg:grid-cols-12 items-start">
                <div className="lg:col-span-5 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-md space-y-4">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3 text-center">
                      <div className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-300">
                        {txt.lenaHai}
                      </div>
                      <div className="text-lg font-black text-rose-700 dark:text-rose-400">
                        ₹{totalLena.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 text-center">
                      <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-300">
                        {txt.denaHai}
                      </div>
                      <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                        ₹{totalDena.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <form
                    onSubmit={handleAddKhataCustomer}
                    className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-gray-800"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={newCustName}
                        onChange={(e) => setNewCustName(e.target.value)}
                        placeholder={txt.custName}
                        className="h-9 text-xs"
                      />
                      <Input
                        value={newCustPhone}
                        onChange={(e) => setNewCustPhone(e.target.value)}
                        placeholder={txt.custPhone}
                        className="h-9 text-xs"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1.5" /> {txt.addCust}
                    </Button>
                  </form>

                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    {khataCustomers.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4">
                        Add your first customer above to start Bahi-Khata.
                      </p>
                    ) : (
                      khataCustomers.map((c) => {
                        const net = getCustomerNet(c);
                        const isSelected = c.id === activeCustomer?.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setActiveCustomerId(c.id)}
                            className={cn(
                              'w-full flex items-center justify-between p-3 rounded-xl text-left border transition-all cursor-pointer',
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40'
                                : 'border-gray-200 dark:border-gray-800',
                            )}
                          >
                            <div>
                              <div className="font-bold text-sm">{c.name}</div>
                              <div className="text-xs text-gray-500">{c.phone}</div>
                            </div>
                            <div className="text-right">
                              <div
                                className={cn(
                                  'font-black text-sm',
                                  net > 0 ? 'text-rose-600' : net < 0 ? 'text-emerald-600' : 'text-gray-500',
                                )}
                              >
                                ₹{Math.abs(net).toLocaleString('en-IN')}
                              </div>
                              <div className="text-[10px] font-bold uppercase text-gray-400">
                                {net > 0 ? 'Lena Hai' : net < 0 ? 'Dena Hai' : 'Clear'}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="lg:col-span-7 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-md space-y-4">
                  {activeCustomer ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div>
                          <h3 className="text-lg font-black">{activeCustomer.name}</h3>
                          <p className="text-xs text-gray-500">WhatsApp: +91 {activeCustomer.phone}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3.5 py-2 text-right">
                            <div className="text-base font-black text-rose-700 dark:text-rose-300">
                              ₹{Math.abs(activeNetBalance).toLocaleString('en-IN')}
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrintActiveKhata}
                            className="rounded-xl font-bold text-xs h-10 border-emerald-200 dark:border-emerald-800"
                          >
                            <Printer className="h-3.5 w-3.5 mr-1.5 text-emerald-700" />
                            Print Khata PDF
                          </Button>

                          <Button
                            asChild
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10"
                          >
                            <a href={khataReminderUrl} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                              {txt.waReminder}
                            </a>
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 p-4 border border-gray-200 dark:border-gray-800 space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Input
                            type="number"
                            min={1}
                            value={entryAmt}
                            onChange={(e) => setEntryAmt(e.target.value)}
                            placeholder="Amount ₹ (e.g. 500)"
                          />
                          <Input
                            value={entryDesc}
                            onChange={(e) => setEntryDesc(e.target.value)}
                            placeholder="Note / Saman Details"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            onClick={() => handleAddKhataEntry('gave')}
                            className="h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs"
                          >
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            {txt.youGave}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleAddKhataEntry('got')}
                            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs"
                          >
                            <ArrowDownLeft className="h-4 w-4 mr-1" />
                            {txt.youGot}
                          </Button>
                        </div>
                      </div>

                      <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        {activeCustomer.entries.map((e) => (
                          <div
                            key={e.id}
                            className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm bg-white dark:bg-gray-900"
                          >
                            <div>
                              <div className="font-bold">{e.note}</div>
                              <div className="text-[11px] text-gray-400">{e.date}</div>
                            </div>
                            <div
                              className={cn(
                                'font-black',
                                e.type === 'gave' ? 'text-rose-600' : 'text-emerald-600',
                              )}
                            >
                              {e.type === 'gave' ? `- ₹${e.amount}` : `+ ₹${e.amount}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center text-gray-500 text-sm">
                      Add a customer on the left to start your personal Digital Bahi-Khata.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ==================== AUTO PAYMENT MODAL AFTER 3 BILLS ==================== */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 border-2 border-indigo-600 p-6 sm:p-8 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <Lock className="h-7 w-7" />
                </div>
                <span className="inline-block rounded-full bg-rose-100 text-rose-700 px-3 py-0.5 text-xs font-black uppercase">
                  {billsUsed} / {FREE_BILL_LIMIT} Free Bills Used
                </span>
                <h3 className="mt-2 text-xl sm:text-2xl font-black">{txt.paywallTitle}</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {txt.paywallSub}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('monthly')}
                  className={cn(
                    'rounded-2xl border-2 p-4 text-left transition-all cursor-pointer',
                    selectedPlan === 'monthly'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50'
                      : 'border-gray-200 dark:border-gray-800',
                  )}
                >
                  <div className="text-xs font-bold text-gray-500">Monthly Plan</div>
                  <div className="text-2xl font-black text-indigo-600 mt-0.5">
                    ₹199<span className="text-xs font-normal">/mo</span>
                  </div>
                  <div className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">
                    ✓ Unlimited Bills &amp; Khata
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlan('yearly')}
                  className={cn(
                    'rounded-2xl border-2 p-4 text-left transition-all cursor-pointer relative',
                    selectedPlan === 'yearly'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50'
                      : 'border-gray-200 dark:border-gray-800',
                  )}
                >
                  <span className="absolute -top-2.5 right-3 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-black uppercase">
                    Best Value
                  </span>
                  <div className="text-xs font-bold text-gray-500">Yearly Plan</div>
                  <div className="text-2xl font-black text-indigo-600 mt-0.5">
                    ₹999<span className="text-xs font-normal">/yr</span>
                  </div>
                  <div className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">
                    ✓ Full Year + Verified Badge
                  </div>
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 p-3.5 text-center text-xs space-y-1">
                <div className="font-extrabold text-indigo-950 dark:text-indigo-200">
                  📱 Official UPI ID / PhonePe / GPay / Paytm
                </div>
                <div className="text-base font-black text-indigo-600 font-mono tracking-wider">
                  6397650818
                </div>
                <div className="text-[11px] text-gray-500">
                  Pay {selectedPlan === 'yearly' ? '₹999' : '₹199'} to this number
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  asChild
                  className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md"
                >
                  <a href={paymentWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-1.5" />
                    {txt.payNowBtn}
                  </a>
                </Button>
              </div>

              {/* Already Paid? Submit UTR Form */}
              <form
                onSubmit={handleSubmitPaymentProof}
                className="mt-4 pt-3.5 border-t border-gray-200 dark:border-gray-800 space-y-2.5 text-left"
              >
                <div className="text-xs font-black text-gray-900 dark:text-white flex items-center justify-between">
                  <span>Already Paid? Submit UPI UTR Number</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Fast Activation</span>
                </div>
                <Input
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="Enter 12-digit UTR / UPI Ref ID (e.g. 402918291029)"
                  className="h-10 text-xs font-mono"
                />
                <Button
                  type="submit"
                  disabled={isSubmittingProof}
                  variant="outline"
                  className="w-full h-10 rounded-xl border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs"
                >
                  {isSubmittingProof ? 'Submitting...' : '✓ Payment Kar Diya — Submit Proof'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VyapariSoftwarePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm">Loading Software...</div>}>
      <VyapariSoftwareContent />
    </Suspense>
  );
}

