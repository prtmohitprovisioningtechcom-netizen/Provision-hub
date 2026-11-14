'use client';

import { useState, useEffect } from 'react';
import {
  Bus,
  MapPin,
  Navigation,
  UserCheck,
  AlertCircle,
  Phone,
  Calendar,
  Clock,
  Fuel,
  ShieldCheck,
  Printer,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  CheckCircle2,
  ChevronRight,
  X,
  Loader2,
  MessageSquare,
  QrCode,
  AlertTriangle,
  Receipt,
  Car,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SchoolTransportPage() {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'routes' | 'students' | 'defaulters'>('vehicles');
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [stops, setStops] = useState<any[]>([]);
  const [allocatedStudents, setAllocatedStudents] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [schoolInfo, setSchoolInfo] = useState<any>(null);

  // Search & filter
  const [searchStudent, setSearchStudent] = useState('');
  const [filterRoute, setFilterRoute] = useState('');

  // Modals
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [targetRouteForStop, setTargetRouteForStop] = useState<any>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [targetVehicleForFuel, setTargetVehicleForFuel] = useState<any>(null);
  const [busPassStudent, setBusPassStudent] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Quick Collect Fee from Defaulters Ledger
  const [collectingDefaulter, setCollectingDefaulter] = useState<any>(null);
  const [collectDefAmount, setCollectDefAmount] = useState('');
  const [collectDefMethod, setCollectDefMethod] = useState('cash');
  const [collectDefRef, setCollectDefRef] = useState('');
  const [isCollectingDef, setIsCollectingDef] = useState(false);

  // Non-transport students for allocation dropdown
  const [allStudentsList, setAllStudentsList] = useState<any[]>([]);

  // Forms
  const [vehicleForm, setVehicleForm] = useState({
    vehicleNo: '',
    vehicleType: 'Bus',
    driverName: '',
    driverPhone: '',
    conductorName: '',
    conductorPhone: '',
    capacity: '35',
    routeName: '',
    insuranceExpiry: '',
    fitnessExpiry: '',
    monthlyFuelCost: '0',
  });

  const [routeForm, setRouteForm] = useState({
    routeName: '',
    vehicleId: '',
    startPoint: '',
    endPoint: '',
    driverName: '',
    driverPhone: '',
    monthlyDefaultFare: '600',
  });

  const [stopForm, setStopForm] = useState({
    stopName: '',
    pickupTime: '07:30 AM',
    dropTime: '02:30 PM',
    monthlyFare: '600',
    orderIndex: '1',
  });

  const [assignForm, setAssignForm] = useState({
    studentId: '',
    routeId: '',
    stopId: '',
    monthlyFare: '',
  });

  const [fuelForm, setFuelForm] = useState({
    amount: '',
    title: 'Diesel Fuel Refill',
    date: new Date().toISOString().split('T')[0],
    notes: 'Full tank refill at Indian Oil pump',
  });

  useEffect(() => {
    fetchTransportData(true);
    fetchSchoolMeta();
  }, []);

  const fetchSchoolMeta = async () => {
    try {
      const res = await fetch('/api/school-erp/auth');
      const json = await res.json();
      if (res.ok && json.data?.school) {
        setSchoolInfo(json.data.school);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTransportData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch('/api/school-erp/transport');
      const json = await res.json();
      if (res.ok && json.success) {
        setVehicles(json.data.vehicles || []);
        setRoutes(json.data.routes || []);
        setStops(json.data.stops || []);
        setAllocatedStudents(json.data.allocatedStudents || []);
        setDefaulters(json.data.defaulters || []);
        setSummary(json.data.summary || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const fetchAllStudentsForAllocation = async () => {
    try {
      const res = await fetch('/api/school-erp/students?status=active');
      const json = await res.json();
      if (res.ok && json.success) {
        setAllStudentsList(json.data.students || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ----------------------------------------------------
  // HANDLERS: VEHICLES
  // ----------------------------------------------------
  const handleOpenAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleForm({
      vehicleNo: '',
      vehicleType: 'Bus',
      driverName: '',
      driverPhone: '',
      conductorName: '',
      conductorPhone: '',
      capacity: '35',
      routeName: '',
      insuranceExpiry: '',
      fitnessExpiry: '',
      monthlyFuelCost: '0',
    });
    setIsVehicleModalOpen(true);
  };

  const handleOpenEditVehicle = (v: any) => {
    setEditingVehicle(v);
    setVehicleForm({
      vehicleNo: v.vehicleNo,
      vehicleType: v.vehicleType || 'Bus',
      driverName: v.driverName || '',
      driverPhone: v.driverPhone || '',
      conductorName: v.conductorName || '',
      conductorPhone: v.conductorPhone || '',
      capacity: String(v.capacity || 35),
      routeName: v.routeName || '',
      insuranceExpiry: v.insuranceExpiry ? v.insuranceExpiry.split('T')[0] : '',
      fitnessExpiry: v.fitnessExpiry ? v.fitnessExpiry.split('T')[0] : '',
      monthlyFuelCost: String(v.monthlyFuelCost || 0),
    });
    setIsVehicleModalOpen(true);
  };

  const handleSubmitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.vehicleNo) {
      toast.error('Vehicle number is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        action: editingVehicle ? 'update_vehicle' : 'add_vehicle',
        ...vehicleForm,
      };
      if (editingVehicle) payload.id = editingVehicle.id;

      const res = await fetch('/api/school-erp/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Vehicle saved');
        setIsVehicleModalOpen(false);
        fetchTransportData();
      } else {
        toast.error(json.message || 'Operation failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string, vNo: string) => {
    if (!confirm(`Are you sure you want to delete vehicle ${vNo}?`)) return;
    try {
      const res = await fetch('/api/school-erp/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_vehicle', id }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Vehicle deleted');
        fetchTransportData();
      } else {
        toast.error(json.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
  };

  // ----------------------------------------------------
  // HANDLERS: ROUTES & STOPS
  // ----------------------------------------------------
  const handleOpenAddRoute = () => {
    setEditingRoute(null);
    setRouteForm({
      routeName: '',
      vehicleId: vehicles[0]?.id || '',
      startPoint: '',
      endPoint: '',
      driverName: vehicles[0]?.driverName || '',
      driverPhone: vehicles[0]?.driverPhone || '',
      monthlyDefaultFare: '600',
    });
    setIsRouteModalOpen(true);
  };

  const handleOpenEditRoute = (r: any) => {
    setEditingRoute(r);
    setRouteForm({
      routeName: r.routeName,
      vehicleId: r.vehicleId || '',
      startPoint: r.startPoint || '',
      endPoint: r.endPoint || '',
      driverName: r.driverName || '',
      driverPhone: r.driverPhone || '',
      monthlyDefaultFare: String(r.monthlyDefaultFare || 600),
    });
    setIsRouteModalOpen(true);
  };

  const handleSubmitRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.routeName) {
      toast.error('Route name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        action: editingRoute ? 'update_route' : 'add_route',
        ...routeForm,
      };
      if (editingRoute) payload.id = editingRoute.id;

      const res = await fetch('/api/school-erp/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Route saved');
        setIsRouteModalOpen(false);
        fetchTransportData();
      } else {
        toast.error(json.message || 'Operation failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoute = async (id: string, name: string) => {
    if (!confirm(`Delete route "${name}" and all its stops? Allocated students will be unassigned.`)) return;
    try {
      const res = await fetch('/api/school-erp/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_route', id }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Route deleted');
        fetchTransportData();
      } else {
        toast.error(json.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
  };

  const handleOpenAddStop = (route: any) => {
    setTargetRouteForStop(route);
    setStopForm({
      stopName: '',
      pickupTime: '07:30 AM',
      dropTime: '02:30 PM',
      monthlyFare: String(route.monthlyDefaultFare || 600),
      orderIndex: String((stops.filter((s) => s.routeId === route.id).length || 0) + 1),
    });
    setIsStopModalOpen(true);
  };

  const handleSubmitStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopForm.stopName || !targetRouteForStop) {
      toast.error('Stop name is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/school-erp/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_stop',
          routeId: targetRouteForStop.id,
          ...stopForm,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Stop added');
        setIsStopModalOpen(false);
        fetchTransportData();
      } else {
        toast.error(json.message || 'Operation failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStop = async (stopId: string, stopName: string) => {
    if (!confirm(`Delete pickup stop "${stopName}"?`)) return;
    try {
      const res = await fetch('/api/school-erp/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_stop', id: stopId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Stop deleted');
        fetchTransportData();
      } else {
        toast.error(json.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
  };

  // ----------------------------------------------------
  // HANDLERS: STUDENT ALLOCATION
  // ----------------------------------------------------
  const handleOpenAssignStudent = () => {
    fetchAllStudentsForAllocation();
    setAssignForm({
      studentId: '',
      routeId: routes[0]?.id || '',
      stopId: '',
      monthlyFare: routes[0]?.monthlyDefaultFare ? String(routes[0].monthlyDefaultFare) : '600',
    });
    setIsAssignModalOpen(true);
  };

  const handleRouteChangeInAssign = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    const routeStops = stops.filter((s) => s.routeId === routeId);
    const firstStop = routeStops[0];
    const fare = firstStop ? firstStop.monthlyFare : route ? route.monthlyDefaultFare : '600';
    setAssignForm({
      ...assignForm,
      routeId,
      stopId: firstStop ? firstStop.id : '',
      monthlyFare: String(fare || 600),
    });
  };

  const handleStopChangeInAssign = (stopId: string) => {
    const stop = stops.find((s) => s.id === stopId);
    setAssignForm({
      ...assignForm,
      stopId,
      monthlyFare: stop ? String(stop.monthlyFare) : assignForm.monthlyFare,
    });
  };

  const handleSubmitAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.studentId || !assignForm.routeId) {
      toast.error('Student and Route are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/school-erp/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_student',
          ...assignForm,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Student assigned to school transport');
        setIsAssignModalOpen(false);
        fetchTransportData();
      } else {
        toast.error(json.message || 'Assignment failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudentTransport = async (studentId: string, studentName: string) => {
    if (!confirm(`Remove ${studentName} from school transport?`)) return;
    try {
      const res = await fetch('/api/school-erp/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_student', studentId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Student removed from transport');
        fetchTransportData();
      } else {
        toast.error(json.message || 'Action failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
  };

  // ----------------------------------------------------
  // HANDLERS: LOG FUEL EXPENSE
  // ----------------------------------------------------
  const handleOpenLogFuel = (vehicle?: any) => {
    setTargetVehicleForFuel(vehicle || null);
    setFuelForm({
      amount: '',
      title: vehicle ? `Diesel Fuel for ${vehicle.vehicleNo}` : 'Bus Diesel & Fuel Refill',
      date: new Date().toISOString().split('T')[0],
      notes: 'Fuel tank refill receipt',
    });
    setIsFuelModalOpen(true);
  };

  const handleSubmitFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelForm.amount || Number(fuelForm.amount) <= 0) {
      toast.error('Valid fuel expense amount is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/school-erp/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_fuel_expense',
          vehicleId: targetVehicleForFuel?.id || null,
          ...fuelForm,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Fuel expense recorded in cashbook');
        setIsFuelModalOpen(false);
        fetchTransportData();
      } else {
        toast.error(json.message || 'Failed to log expense');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCollectFromDefaulter = (def: any) => {
    const bal = Number(def.totalAmount || 0) - Number(def.paidAmount || 0);
    setCollectingDefaulter(def);
    setCollectDefAmount(String(bal));
    setCollectDefMethod('cash');
    setCollectDefRef('');
  };

  const handleSubmitCollectDefaulter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingDefaulter || !collectDefAmount) return;
    setIsCollectingDef(true);
    try {
      const res = await fetch('/api/school-erp/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_payment',
          invoiceId: collectingDefaulter.invoiceId,
          studentId: collectingDefaulter.studentId,
          amount: collectDefAmount,
          paymentMethod: collectDefMethod,
          transactionRef: collectDefRef,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Payment recorded! Receipt: ${json.data.receiptNo}`);
        setCollectingDefaulter(null);
        fetchTransportData();
      } else {
        toast.error(json.message || 'Payment recording failed');
      }
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setIsCollectingDef(false);
    }
  };

  // WhatsApp Reminder for fee defaulters
  const sendWhatsAppReminder = (def: any) => {
    const phone = (def.fatherPhone || '').replace(/\D/g, '');
    if (!phone) {
      toast.error('Parent contact number is missing');
      return;
    }
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const balance = Number(def.totalAmount || 0) - Number(def.paidAmount || 0);
    const msg = `Dear Parent, Greetings from ${schoolInfo?.name || 'School'}. This is a gentle reminder that fee invoice (${def.invoiceNo}) including School Bus & Transport charges has an outstanding balance of Rs. ${balance}. Kindly clear the dues before ${def.dueDate ? new Date(def.dueDate).toLocaleDateString() : 'due date'}. Thank you!`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // Filtered Students
  const filteredAllocated = allocatedStudents.filter((s) => {
    const matchesSearch =
      !searchStudent ||
      `${s.firstName} ${s.lastName} ${s.admissionNo} ${s.fatherPhone}`
        .toLowerCase()
        .includes(searchStudent.toLowerCase());
    const matchesRoute = !filterRoute || s.transportRouteId === filterRoute;
    return matchesSearch && matchesRoute;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-600">
              <Bus className="h-6 w-6" />
            </span>
            School Bus & Transport Fleet
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete vehicle fleet management, pickup/drop routes, per-stop monthly fares, student bus passes, and fee billing integration.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenAddVehicle}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-1.5 shadow cursor-pointer transition-all duration-150 active:scale-[0.96]"
          >
            <Plus className="h-4 w-4" /> Add Vehicle
          </button>
          <button
            onClick={handleOpenAddRoute}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5 shadow cursor-pointer transition-all duration-150 active:scale-[0.96]"
          >
            <Navigation className="h-4 w-4" /> Add Route
          </button>
          <button
            onClick={handleOpenAssignStudent}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5 shadow cursor-pointer transition-all duration-150 active:scale-[0.96]"
          >
            <UserCheck className="h-4 w-4" /> Assign Student
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Total Fleet</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {summary.totalVehicles || 0}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Buses & Vans</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Active Routes</span>
          <div className="text-2xl font-black text-indigo-600">
            {summary.totalRoutes || 0}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Coverage corridors</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Pickup Stops</span>
          <div className="text-2xl font-black text-sky-600">
            {summary.totalStops || 0}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Designated points</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Students On Bus</span>
          <div className="text-2xl font-black text-emerald-600">
            {summary.totalBusStudents || 0}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Pass holders</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Monthly Bus Fee</span>
          <div className="text-2xl font-black text-amber-600">
            ₹{Number(summary.totalMonthlyBusRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Added to invoices</span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Fuel / Diesel</span>
          <div className="text-2xl font-black text-rose-600">
            ₹{Number(summary.totalMonthlyFuelCost || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Expense ledger</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.97] whitespace-nowrap ${
            activeTab === 'vehicles'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Car className="h-4 w-4" /> 1. Vehicles Fleet ({vehicles.length})
        </button>

        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.97] whitespace-nowrap ${
            activeTab === 'routes'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MapPin className="h-4 w-4" /> 2. Routes & Stops ({routes.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.97] whitespace-nowrap ${
            activeTab === 'students'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <UserCheck className="h-4 w-4" /> 3. Student Allocations ({allocatedStudents.length})
        </button>

        <button
          onClick={() => setActiveTab('defaulters')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.97] whitespace-nowrap ${
            activeTab === 'defaulters'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertCircle className="h-4 w-4" /> 4. Bus Fee Defaulters ({defaulters.length})
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-2" />
          <p className="text-xs text-slate-500">Loading school transport records...</p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 1: VEHICLES FLEET */}
      {/* ------------------------------------------------------------------ */}
      {!loading && activeTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Showing {vehicles.length} vehicle(s) in active fleet
            </span>
            <button
              onClick={() => handleOpenLogFuel()}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 cursor-pointer"
            >
              <Fuel className="h-3.5 w-3.5" /> Log Fuel/Diesel Expense
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {vehicles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Vehicle No</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Capacity</th>
                      <th className="py-3 px-4">Driver & Contact</th>
                      <th className="py-3 px-4">Conductor</th>
                      <th className="py-3 px-4">Insurance / Fitness</th>
                      <th className="py-3 px-4">Fuel Expense</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {vehicles.map((v) => {
                      const isInsExpiring = v.insuranceExpiry && new Date(v.insuranceExpiry) < new Date(Date.now() + 30 * 86400000);
                      const isFitExpiring = v.fitnessExpiry && new Date(v.fitnessExpiry) < new Date(Date.now() + 30 * 86400000);

                      return (
                        <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-mono font-black text-indigo-600 text-sm">
                            {v.vehicleNo}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {v.vehicleType || 'Bus'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {v.capacity} Seats
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {v.driverName || 'Not Assigned'}
                            </div>
                            {v.driverPhone && (
                              <a
                                href={`tel:${v.driverPhone}`}
                                className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 mt-0.5"
                              >
                                <Phone className="h-3 w-3" /> {v.driverPhone}
                              </a>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                              {v.conductorName || '—'}
                            </div>
                            {v.conductorPhone && (
                              <span className="text-[10px] text-slate-400 block">{v.conductorPhone}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-0.5 text-[11px]">
                              <div>
                                <span className="text-slate-400 text-[10px]">Ins: </span>
                                {v.insuranceExpiry ? (
                                  <span className={isInsExpiring ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                                    {new Date(v.insuranceExpiry).toLocaleDateString()}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">N/A</span>
                                )}
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px]">Fit: </span>
                                {v.fitnessExpiry ? (
                                  <span className={isFitExpiring ? 'text-amber-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                                    {new Date(v.fitnessExpiry).toLocaleDateString()}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">N/A</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-rose-600">
                            ₹{Number(v.monthlyFuelCost || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenLogFuel(v)}
                                title="Add Fuel Receipt"
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                              >
                                <Fuel className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditVehicle(v)}
                                title="Edit Vehicle"
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteVehicle(v.id, v.vehicleNo)}
                                title="Delete Vehicle"
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                <Bus className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                No vehicles added yet. Click &quot;Add Vehicle&quot; to register your first school bus or van.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 2: ROUTES & PICKUP STOPS */}
      {/* ------------------------------------------------------------------ */}
      {!loading && activeTab === 'routes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {routes.length} Active Route(s) configured
            </span>
            <button
              onClick={handleOpenAddRoute}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="h-4 w-4" /> Create New Route
            </button>
          </div>

          {routes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {routes.map((route) => {
                const routeStops = stops.filter((s) => s.routeId === route.id);

                return (
                  <div
                    key={route.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    {/* Route Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-7 w-7 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                            <Navigation className="h-4 w-4" />
                          </span>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">
                            {route.routeName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span>Bus: <strong className="text-slate-800 dark:text-slate-200">{route.vehicleNo || 'Unassigned'}</strong></span>
                          <span>•</span>
                          <span>Fare Base: <strong className="text-emerald-600">₹{route.monthlyDefaultFare}/mo</strong></span>
                          <span>•</span>
                          <span>Students: <strong className="text-indigo-600">{route.passengerCount || 0}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditRoute(route)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                          title="Edit Route"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoute(route.id, route.routeName)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                          title="Delete Route"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Driver & Path info */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Driver Details</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {route.driverName || 'No Driver'}
                        </span>
                        {route.driverPhone && (
                          <span className="text-[11px] text-slate-500">{route.driverPhone}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Start → End</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block truncate">
                          {route.startPoint || 'Point A'} → {route.endPoint || 'School'}
                        </span>
                      </div>
                    </div>

                    {/* Stops List */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase text-slate-400">
                          Pickup & Drop Stops ({routeStops.length})
                        </span>
                        <button
                          onClick={() => handleOpenAddStop(route)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Add Stop
                        </button>
                      </div>

                      {routeStops.length > 0 ? (
                        <div className="space-y-1.5">
                          {routeStops.map((stop, idx) => (
                            <div
                              key={stop.id}
                              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="h-5 w-5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">
                                    {stop.stopName}
                                  </span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-2">
                                    <span>Pickup: {stop.pickupTime}</span>
                                    <span>Drop: {stop.dropTime}</span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <span className="font-mono font-bold text-emerald-600 block">
                                    ₹{stop.monthlyFare}/mo
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {stop.studentCount || 0} students
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteStop(stop.id, stop.stopName)}
                                  className="text-slate-400 hover:text-red-500 cursor-pointer"
                                  title="Delete Stop"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                          No stops added yet. Click &quot;Add Stop&quot; to configure pickup points with fares.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <MapPin className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              No transport routes defined yet. Click &quot;Create New Route&quot; to establish bus corridors.
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 3: STUDENT BUS ALLOCATIONS */}
      {/* ------------------------------------------------------------------ */}
      {!loading && activeTab === 'students' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search student, adm no, phone..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterRoute}
                onChange={(e) => setFilterRoute(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
              >
                <option value="">All Routes</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.routeName}
                  </option>
                ))}
              </select>

              <button
                onClick={handleOpenAssignStudent}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow"
              >
                <Plus className="h-4 w-4" /> Assign New Student
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {filteredAllocated.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Route & Bus</th>
                      <th className="py-3 px-4">Pickup Stop & Time</th>
                      <th className="py-3 px-4">Monthly Bus Fee</th>
                      <th className="py-3 px-4">Parent Phone</th>
                      <th className="py-3 px-4 text-center">Bus Pass / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAllocated.map((std) => (
                      <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {std.firstName} {std.lastName}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Adm: {std.admissionNo} • Roll: {std.rollNo || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {std.className} ({std.sectionName || 'A'})
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-indigo-600 block">{std.routeName || 'Allocated'}</span>
                          <span className="text-[10px] text-slate-400">Bus: {std.vehicleNo || 'General'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                            <MapPin className="h-3 w-3 text-amber-500" />
                            {std.stopName || 'Designated Stop'}
                          </div>
                          <span className="text-[10px] text-slate-400 block ml-4">
                            Pickup: {std.pickupTime || '07:30 AM'} • Drop: {std.dropTime || '02:30 PM'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-sm">
                          ₹{Number(std.monthlyTransportFee || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          {std.fatherPhone ? (
                            <a
                              href={`tel:${std.fatherPhone}`}
                              className="text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                            >
                              <Phone className="h-3 w-3 text-slate-400" /> {std.fatherPhone}
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setBusPassStudent(std)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="h-3 w-3" /> Bus Pass
                            </button>
                            <button
                              onClick={() => handleRemoveStudentTransport(std.id, `${std.firstName} ${std.lastName}`)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"
                              title="Remove from Transport"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                <UserCheck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                No students assigned to school transport yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 4: BUS FEE DEFAULTERS */}
      {/* ------------------------------------------------------------------ */}
      {!loading && activeTab === 'defaulters' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Transport Fee Outstanding Ledger
              </h3>
              <p className="text-xs text-amber-800/80 dark:text-amber-400 mt-0.5">
                Students using school bus whose invoices are pending or overdue. Click WhatsApp to notify parents instantly.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-black text-xs shrink-0">
              {defaulters.length} Pending
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {defaulters.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Invoice No</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Route & Stop</th>
                      <th className="py-3 px-4">Total Billed</th>
                      <th className="py-3 px-4">Pending Due</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {defaulters.map((def) => {
                      const balance = Number(def.totalAmount || 0) - Number(def.paidAmount || 0);

                      return (
                        <tr key={def.invoiceId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600">{def.invoiceNo}</td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {def.firstName} {def.lastName}
                            <span className="block text-[10px] text-slate-400 font-normal">{def.admissionNo}</span>
                          </td>
                          <td className="py-3 px-4">
                            {def.className} ({def.sectionName || 'A'})
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {def.routeName || 'Transport Route'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Stop: {def.stopName || 'General Stop'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold">₹{def.totalAmount}</td>
                          <td className="py-3 px-4 font-mono font-black text-rose-600 text-sm">
                            ₹{balance}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {def.dueDate ? new Date(def.dueDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenCollectFromDefaulter(def)}
                                className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 flex items-center gap-1 cursor-pointer shadow-xs transition-all duration-150 active:scale-[0.96]"
                                title="Collect Outstanding Bus Fee"
                              >
                                <Receipt className="h-3 w-3" /> Collect ₹{balance}
                              </button>
                              <button
                                onClick={() => sendWhatsAppReminder(def)}
                                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all duration-150 active:scale-[0.96]"
                                title="Send WhatsApp Fee Reminder"
                              >
                                <MessageSquare className="h-3 w-3 text-emerald-600" /> WhatsApp
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
                All bus fees are up to date! No defaulters found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: ADD / EDIT VEHICLE */}
      {/* ------------------------------------------------------------------ */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Car className="h-5 w-5 text-indigo-600" />
                {editingVehicle ? 'Edit Vehicle' : 'Register New Fleet Vehicle'}
              </h3>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitVehicle} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Registration No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-01-AB-1234"
                    value={vehicleForm.vehicleNo}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNo: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleForm.vehicleType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    <option value="Bus">School Bus (Large)</option>
                    <option value="Mini Bus">Mini Bus</option>
                    <option value="Van">Omni / Winger Van</option>
                    <option value="Auto">Auto Rickshaw</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Seating Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Route Area</label>
                  <input
                    type="text"
                    placeholder="e.g. North Zone"
                    value={vehicleForm.routeName}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, routeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Driver & Conductor Details</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Driver Full Name"
                    value={vehicleForm.driverName}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Driver Mobile (10 digits)"
                    value={vehicleForm.driverPhone}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Conductor Name (optional)"
                    value={vehicleForm.conductorName}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, conductorName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Conductor Phone"
                    value={vehicleForm.conductorPhone}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, conductorPhone: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Insurance Expiry Date
                  </label>
                  <input
                    type="date"
                    value={vehicleForm.insuranceExpiry}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, insuranceExpiry: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fitness Certificate Expiry
                  </label>
                  <input
                    type="date"
                    value={vehicleForm.fitnessExpiry}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, fitnessExpiry: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: ADD / EDIT ROUTE */}
      {/* ------------------------------------------------------------------ */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Navigation className="h-5 w-5 text-indigo-600" />
                {editingRoute ? 'Edit Route' : 'Create Transport Route'}
              </h3>
              <button onClick={() => setIsRouteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRoute} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Route Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Route #1: South Extension - Campus"
                  value={routeForm.routeName}
                  onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Vehicle</label>
                <select
                  value={routeForm.vehicleId}
                  onChange={(e) => {
                    const vehId = e.target.value;
                    const v = vehicles.find((x) => x.id === vehId);
                    setRouteForm({
                      ...routeForm,
                      vehicleId: vehId,
                      driverName: v ? v.driverName : routeForm.driverName,
                      driverPhone: v ? v.driverPhone : routeForm.driverPhone,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="">Select a Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleNo} ({v.vehicleType}) - Driver: {v.driverName || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Point</label>
                  <input
                    type="text"
                    placeholder="e.g. Anand Vihar"
                    value={routeForm.startPoint}
                    onChange={(e) => setRouteForm({ ...routeForm, startPoint: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Point</label>
                  <input
                    type="text"
                    placeholder="e.g. School Gate 1"
                    value={routeForm.endPoint}
                    onChange={(e) => setRouteForm({ ...routeForm, endPoint: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={routeForm.driverName}
                    onChange={(e) => setRouteForm({ ...routeForm, driverName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Driver Phone</label>
                  <input
                    type="text"
                    value={routeForm.driverPhone}
                    onChange={(e) => setRouteForm({ ...routeForm, driverPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default Monthly Fare (₹)
                </label>
                <input
                  type="number"
                  value={routeForm.monthlyDefaultFare}
                  onChange={(e) => setRouteForm({ ...routeForm, monthlyDefaultFare: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRouteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingRoute ? 'Update Route' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: ADD STOP TO ROUTE */}
      {/* ------------------------------------------------------------------ */}
      {isStopModalOpen && targetRouteForStop && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600" /> Add Pickup & Drop Stop
                </h3>
                <span className="text-[11px] text-slate-400">Route: {targetRouteForStop.routeName}</span>
              </div>
              <button onClick={() => setIsStopModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitStop} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Stop Name / Landmark *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metro Pillar No. 42"
                  value={stopForm.stopName}
                  onChange={(e) => setStopForm({ ...stopForm, stopName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Morning Pickup Time
                  </label>
                  <input
                    type="text"
                    value={stopForm.pickupTime}
                    onChange={(e) => setStopForm({ ...stopForm, pickupTime: e.target.value })}
                    placeholder="07:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Afternoon Drop Time
                  </label>
                  <input
                    type="text"
                    value={stopForm.dropTime}
                    onChange={(e) => setStopForm({ ...stopForm, dropTime: e.target.value })}
                    placeholder="02:30 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Stop Fare (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={stopForm.monthlyFare}
                    onChange={(e) => setStopForm({ ...stopForm, monthlyFare: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Stop Order Index
                  </label>
                  <input
                    type="number"
                    value={stopForm.orderIndex}
                    onChange={(e) => setStopForm({ ...stopForm, orderIndex: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStopModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Stop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: ASSIGN STUDENT TO TRANSPORT */}
      {/* ------------------------------------------------------------------ */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" /> Assign Student to School Bus
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssign} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Student *
                </label>
                <select
                  required
                  value={assignForm.studentId}
                  onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="">Choose Student</option>
                  {allStudentsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.className || 'Class'} - {s.admissionNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transport Route *
                </label>
                <select
                  required
                  value={assignForm.routeId}
                  onChange={(e) => handleRouteChangeInAssign(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="">Select Route</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.routeName} (Bus: {r.vehicleNo || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pickup & Drop Stop
                </label>
                <select
                  value={assignForm.stopId}
                  onChange={(e) => handleStopChangeInAssign(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="">Select Stop on this route</option>
                  {stops
                    .filter((s) => s.routeId === assignForm.routeId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.stopName} (Pickup: {s.pickupTime} - ₹{s.monthlyFare}/mo)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Bus Fee (₹)
                </label>
                <input
                  type="number"
                  value={assignForm.monthlyFare}
                  onChange={(e) => setAssignForm({ ...assignForm, monthlyFare: e.target.value })}
                  placeholder="Auto populated from stop fare"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm text-emerald-600 outline-none"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  This fee will automatically appear on the student&apos;s monthly tuition bill.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? 'Assigning...' : 'Assign to Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: LOG DIESEL / REPAIR EXPENSE */}
      {/* ------------------------------------------------------------------ */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Fuel className="h-5 w-5 text-rose-600" /> Record Vehicle Diesel / Expense
              </h3>
              <button onClick={() => setIsFuelModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitFuel} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Vehicle
                </label>
                <select
                  value={targetVehicleForFuel?.id || ''}
                  onChange={(e) => {
                    const v = vehicles.find((x) => x.id === e.target.value);
                    setTargetVehicleForFuel(v || null);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="">General Transport Expense</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleNo} ({v.vehicleType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 4500"
                  value={fuelForm.amount}
                  onChange={(e) => setFuelForm({ ...fuelForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm text-rose-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Title / Category
                </label>
                <input
                  type="text"
                  value={fuelForm.title}
                  onChange={(e) => setFuelForm({ ...fuelForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={fuelForm.date}
                  onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Petrol Pump Slip No
                </label>
                <input
                  type="text"
                  value={fuelForm.notes}
                  onChange={(e) => setFuelForm({ ...fuelForm, notes: e.target.value })}
                  placeholder="Bill No. IOCL-84912"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Record in Cashbook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: COLLECT DEFAULTER BUS FEE */}
      {/* ------------------------------------------------------------------ */}
      {collectingDefaulter && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-emerald-600" /> Collect Bus Fee Dues
              </h4>
              <button onClick={() => setCollectingDefaulter(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 mb-3">
              <span className="font-bold text-slate-900 dark:text-white block">
                {collectingDefaulter.firstName} {collectingDefaulter.lastName} ({collectingDefaulter.admissionNo})
              </span>
              <span className="text-[11px] text-slate-500 block">
                Invoice: {collectingDefaulter.invoiceNo} • Route: {collectingDefaulter.routeName}
              </span>
            </div>

            <form onSubmit={handleSubmitCollectDefaulter} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount to Pay (₹) *</label>
                <input
                  type="number"
                  required
                  value={collectDefAmount}
                  onChange={(e) => setCollectDefAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm text-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={collectDefMethod}
                  onChange={(e) => setCollectDefMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  <option value="cash">Cash (Counter)</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="bank_transfer">Bank Transfer / IMPS</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reference / UTR / Cheque No</label>
                <input
                  type="text"
                  placeholder="Optional reference"
                  value={collectDefRef}
                  onChange={(e) => setCollectDefRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCollectingDefaulter(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCollectingDef}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isCollectingDef ? 'Saving...' : 'Record Payment & Issue Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: PRINTABLE STUDENT BUS PASS */}
      {/* ------------------------------------------------------------------ */}
      {busPassStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <span className="text-xs font-black uppercase text-amber-600 flex items-center gap-1.5">
                <Bus className="h-4 w-4" /> Student Transport Identity Pass
              </span>
              <button onClick={() => setBusPassStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* BUS PASS CARD */}
            <div className="border-2 border-amber-500/80 rounded-2xl p-4 bg-gradient-to-br from-amber-500/5 via-white to-amber-500/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-2 bg-amber-500 text-white font-black text-[9px] uppercase px-5 py-0.5 rotate-12">
                BUS PASS
              </div>

              {/* School Header */}
              <div className="text-center pb-2.5 border-b border-amber-200">
                <h4 className="font-black text-sm uppercase text-slate-900">
                  {schoolInfo?.name || 'School ERP'}
                </h4>
                <p className="text-[10px] text-slate-500 truncate">{schoolInfo?.address || 'Campus Road'}</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Session 2026 - 2027
                </span>
              </div>

              {/* Student info */}
              <div className="py-3 flex gap-3 items-center">
                <div className="h-16 w-16 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0 text-slate-400 font-bold text-xs uppercase">
                  {busPassStudent.firstName?.[0]}
                  {busPassStudent.lastName?.[0]}
                </div>
                <div className="space-y-0.5 text-xs">
                  <h5 className="font-black text-slate-900 text-sm">
                    {busPassStudent.firstName} {busPassStudent.lastName}
                  </h5>
                  <div className="text-[11px] text-slate-600 font-semibold">
                    Class: {busPassStudent.className} ({busPassStudent.sectionName || 'A'})
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Adm No: {busPassStudent.admissionNo}
                  </div>
                </div>
              </div>

              {/* Route & Stop Details */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-white border border-amber-200 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Route:</span>
                  <span className="font-bold text-indigo-700">{busPassStudent.routeName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Vehicle:</span>
                  <span className="font-mono font-bold text-slate-800">{busPassStudent.vehicleNo || 'General'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Pickup Stop:</span>
                  <span className="font-bold text-slate-900">{busPassStudent.stopName || 'Designated Point'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Pickup Time:</span>
                  <span className="font-semibold text-emerald-700">{busPassStudent.pickupTime || '07:30 AM'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Driver Phone:</span>
                  <span className="font-mono font-semibold text-slate-700">{busPassStudent.driverPhone || 'School Office'}</span>
                </div>
              </div>

              {/* Footer Stamp & QR */}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-amber-200 text-[9px] text-slate-400">
                <div>
                  <span className="block font-bold text-slate-700">Transport Incharge</span>
                  <span>Authorized Signature</span>
                </div>
                <QrCode className="h-8 w-8 text-slate-800" />
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-4 w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 flex items-center justify-center gap-1.5 shadow cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Print / Download Bus Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
