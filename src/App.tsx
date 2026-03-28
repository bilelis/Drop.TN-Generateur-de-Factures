import React, { useState } from 'react';
import { Plus, Trash2, Download, FileText, User, ShoppingCart, CreditCard, Settings, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types
interface Product {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  siret: string;
  logo?: string;
}

interface ClientInfo {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  gouvernorat: string;
  city: string;
  zipCode: string;
}

interface OrderInfo {
  number: string;
  date: string;
  paymentMethod: string;
  notes: string;
  shippingFee: number;
}

export default function App() {
  // State
  const [company, setCompany] = useState<CompanyInfo>({
    name: 'Drop.TN',
    address: 'Tunis, Tunisie',
    city: 'Tunis',
    zipCode: '1000',
    country: 'Tunisie',
    phone: '+216 XX XXX XXX',
    email: 'contact@drop.tn',
    siret: 'MF: 1234567/A/P/000',
  });

  const [client, setClient] = useState<ClientInfo>({
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    phone: '+216 98 000 000',
    address: 'Rue de la Liberté, App 4',
    gouvernorat: 'Tunis',
    city: 'Tunis',
    zipCode: '1000',
  });

  const [order, setOrder] = useState<OrderInfo>({
    number: `DROP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'Cash à la livraison',
    notes: 'Livraison sous 24-48h. Merci d\'avoir choisi Drop.TN !',
    shippingFee: 7,
  });

  const [products, setProducts] = useState<Product[]>([
    { id: crypto.randomUUID(), name: 'Caplori Heritage Born Emotion', quantity: 1, unitPrice: 69, vatRate: 19 },
  ]);

  // Calculations
  const subtotalHT = products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const totalVAT = products.reduce((acc, p) => acc + (p.quantity * p.unitPrice * (p.vatRate / 100)), 0);
  const totalTTC = subtotalHT + totalVAT + (order.shippingFee || 0);

  const gouvernorats = [
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 
    'Kairouan', 'Kasserine', 'Kebili', 'Kef', 'Mahdia', 'Manouba', 'Medenine', 
    'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 
    'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
  ];

  const catalog = [
    { name: 'Caplori Nero Classico', price: 69 },
    { name: 'Caplori Azure Dubai', price: 69 },
    { name: 'Caplori Heritage Born Emotion', price: 69 },
    { name: 'Caplori Rosa Premium', price: 69 },
  ];

  // Handlers
  const addProduct = () => {
    setProducts([...products, { id: crypto.randomUUID(), name: '', quantity: 1, unitPrice: 0, vatRate: 19 }]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const selectFromCatalog = (id: string, productName: string) => {
    const item = catalog.find(c => c.name === productName);
    if (item) {
      setProducts(products.map(p => p.id === id ? { ...p, name: item.name, unitPrice: item.price } : p));
    } else {
      updateProduct(id, 'name', productName);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompany({ ...company, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Logo
    if (company.logo) {
      try {
        doc.addImage(company.logo, 'PNG', 15, 15, 40, 20);
      } catch (e) {
        console.error("Logo error", e);
      }
    }

    // Company Info (Top Right)
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(company.name, pageWidth - 15, 20, { align: 'right' });
    doc.text(company.address, pageWidth - 15, 25, { align: 'right' });
    doc.text(`${company.zipCode} ${company.city}`, pageWidth - 15, 30, { align: 'right' });
    doc.text(company.country, pageWidth - 15, 35, { align: 'right' });
    doc.text(`SIRET: ${company.siret}`, pageWidth - 15, 40, { align: 'right' });

    // Header Line
    doc.setDrawColor(230);
    doc.line(15, 50, pageWidth - 15, 50);

    // Invoice Title & Info
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('FACTURE DROP.TN', 15, 65);
    
    doc.setFontSize(10);
    doc.text(`N° de commande: ${order.number}`, 15, 75);
    doc.text(`Date: ${format(new Date(order.date), 'dd/MM/yyyy')}`, 15, 80);
    doc.text(`Paiement: ${order.paymentMethod}`, 15, 85);

    // Client Info
    doc.setFontSize(11);
    doc.text('Facturé à :', 15, 100);
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`${client.firstName} ${client.lastName}`, 15, 107);
    doc.text(client.address || '', 15, 112);
    doc.text(`${client.zipCode || ''} ${client.city || ''}`, 15, 117);
    doc.text(client.gouvernorat || '', 15, 122);
    doc.text(`Tél: ${client.phone || ''}`, 15, 127);

    // Products Table
    const tableData = products.map(p => [
      p.name || 'Produit',
      p.quantity.toString(),
      `${p.unitPrice.toFixed(2)} TND`,
      `${p.vatRate}%`,
      `${(p.quantity * p.unitPrice).toFixed(2)} TND`
    ]);

    autoTable(doc, {
      startY: 140,
      head: [['Description', 'Qté', 'Prix Unit. HT', 'TVA', 'Total HT']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'center' },
        4: { halign: 'right' },
      }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 140;

    // Totals
    const totalsX = pageWidth - 15;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Total HT:`, totalsX - 40, finalY + 15);
    doc.text(`${subtotalHT.toFixed(2)} TND`, totalsX, finalY + 15, { align: 'right' });
    
    doc.text(`Total TVA:`, totalsX - 40, finalY + 22);
    doc.text(`${totalVAT.toFixed(2)} TND`, totalsX, finalY + 22, { align: 'right' });

    doc.text(`Livraison:`, totalsX - 40, finalY + 29);
    doc.text(`${order.shippingFee.toFixed(2)} TND`, totalsX, finalY + 29, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL À PAYER:`, totalsX - 40, finalY + 39);
    doc.text(`${totalTTC.toFixed(2)} TND`, totalsX, finalY + 39, { align: 'right' });

    // Notes
    if (order.notes) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('Notes:', 15, finalY + 50);
      doc.text(order.notes, 15, finalY + 55, { maxWidth: pageWidth - 30 });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    const footerText = `${company.name} - SIRET: ${company.siret} - ${company.email}`;
    doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    doc.save(`Facture_${order.number}.pdf`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-neutral-800">
      {/* Header */}
      <header className="bg-black border-b border-neutral-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white p-2 rounded-lg">
              <FileText className="text-black w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Drop<span className="text-neutral-500">.TN</span></h1>
          </div>
          <button 
            onClick={generatePDF}
            className="bg-white hover:bg-neutral-200 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Download className="w-4 h-4" />
            Générer Facture
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Company Section */}
            <section className="bg-neutral-900 rounded-2xl shadow-sm border border-neutral-800 overflow-hidden">
              <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-neutral-400" />
                  <h2 className="font-semibold text-white">Branding Drop.TN</h2>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Logo de la marque</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 border-2 border-dashed border-neutral-800 rounded-xl flex items-center justify-center bg-black overflow-hidden">
                      {company.logo ? (
                        <img src={company.logo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-neutral-700" />
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      className="text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Nom de la marque</label>
                  <input 
                    type="text" 
                    value={company.name} 
                    onChange={e => setCompany({...company, name: e.target.value})}
                    className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Adresse (Tunisie)</label>
                  <input 
                    type="text" 
                    value={company.address} 
                    onChange={e => setCompany({...company, address: e.target.value})}
                    className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Code Postal</label>
                  <input 
                    type="text" 
                    value={company.zipCode} 
                    onChange={e => setCompany({...company, zipCode: e.target.value})}
                    className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Ville</label>
                  <input 
                    type="text" 
                    value={company.city} 
                    onChange={e => setCompany({...company, city: e.target.value})}
                    className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Matricule Fiscal</label>
                  <input 
                    type="text" 
                    value={company.siret} 
                    onChange={e => setCompany({...company, siret: e.target.value})}
                    className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Email Support</label>
                  <input 
                    type="email" 
                    value={company.email} 
                    onChange={e => setCompany({...company, email: e.target.value})}
                    className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white"
                  />
                </div>
              </div>
            </section>

            {/* Client Section */}
            <section className="bg-neutral-900 rounded-2xl shadow-sm border border-neutral-800 overflow-hidden">
              <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-neutral-400" />
                  <h2 className="font-semibold text-white">Informations Personnelles</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Prénom</label>
                    <input 
                      type="text" 
                      placeholder="Ahmed"
                      value={client.firstName} 
                      onChange={e => setClient({...client, firstName: e.target.value})}
                      className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Nom</label>
                    <input 
                      type="text" 
                      placeholder="Ben Ali"
                      value={client.lastName} 
                      onChange={e => setClient({...client, lastName: e.target.value})}
                      className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white outline-none text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Numéro de téléphone</label>
                    <input 
                      type="text" 
                      placeholder="+216 XX XXX XXX"
                      value={client.phone} 
                      onChange={e => setClient({...client, phone: e.target.value})}
                      className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white outline-none text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white border-l-4 border-white pl-2">Adresse de livraison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Adresse complète</label>
                      <input 
                        type="text" 
                        placeholder="Rue, Numéro, Appartement..."
                        value={client.address} 
                        onChange={e => setClient({...client, address: e.target.value})}
                        className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white outline-none text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Gouvernorat</label>
                      <select 
                        value={client.gouvernorat} 
                        onChange={e => setClient({...client, gouvernorat: e.target.value})}
                        className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white outline-none text-white"
                      >
                        <option value="">Choisir...</option>
                        {gouvernorats.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Ville</label>
                      <input 
                        type="text" 
                        value={client.city} 
                        onChange={e => setClient({...client, city: e.target.value})}
                        className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white outline-none text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Code Postal</label>
                      <input 
                        type="text" 
                        value={client.zipCode} 
                        onChange={e => setClient({...client, zipCode: e.target.value})}
                        className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white outline-none text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Order Section */}
            <section className="bg-neutral-900 rounded-2xl shadow-sm border border-neutral-800 overflow-hidden">
              <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-neutral-400" />
                  <h2 className="font-semibold text-white">Détails Commande</h2>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">N° Commande</label>
                  <input 
                    type="text" 
                    value={order.number} 
                    onChange={e => setOrder({...order, number: e.target.value})}
                    className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Date</label>
                  <input 
                    type="date" 
                    value={order.date} 
                    onChange={e => setOrder({...order, date: e.target.value})}
                    className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Mode de paiement</label>
                  <select 
                    value={order.paymentMethod} 
                    onChange={e => setOrder({...order, paymentMethod: e.target.value})}
                    className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white"
                  >
                    <option>Cash à la livraison</option>
                    <option>Virement Bancaire</option>
                    <option>Flouci / Konnect</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Frais de livraison (TND)</label>
                  <input 
                    type="number" 
                    value={order.shippingFee} 
                    onChange={e => setOrder({...order, shippingFee: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all text-white"
                  />
                </div>
              </div>
            </section>

            {/* Products Section */}
            <section className="bg-neutral-900 rounded-2xl shadow-sm border border-neutral-800 overflow-hidden">
              <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-neutral-400" />
                  <h2 className="font-semibold text-white">Articles Drop.TN</h2>
                </div>
                <button 
                  onClick={addProduct}
                  className="text-white hover:text-neutral-300 font-bold text-sm flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter Produit
                </button>
              </div>
              <div className="p-6 space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="group relative grid grid-cols-12 gap-3 p-4 bg-black rounded-xl border border-neutral-800 transition-all hover:border-neutral-600">
                    <div className="col-span-12 md:col-span-5">
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Produit</label>
                      <select 
                        value={product.name} 
                        onChange={e => selectFromCatalog(product.id, e.target.value)}
                        className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white outline-none text-white"
                      >
                        <option value="">Choisir un article...</option>
                        {catalog.map(item => (
                          <option key={item.name} value={item.name}>{item.name} ({item.price} TND)</option>
                        ))}
                        <option value="custom">Autre (Saisie manuelle)</option>
                      </select>
                      {product.name === 'custom' || (!catalog.find(c => c.name === product.name) && product.name !== '') ? (
                        <input 
                          type="text" 
                          placeholder="Nom du produit personnalisé"
                          value={product.name === 'custom' ? '' : product.name} 
                          onChange={e => updateProduct(product.id, 'name', e.target.value)}
                          className="w-full mt-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white outline-none text-white"
                        />
                      ) : null}
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Qté</label>
                      <input 
                        type="number" 
                        min="1"
                        value={product.quantity} 
                        onChange={e => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white outline-none text-white"
                      />
                    </div>
                    <div className="col-span-5 md:col-span-2">
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Prix HT (TND)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={product.unitPrice} 
                        onChange={e => updateProduct(product.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white outline-none text-white"
                      />
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">TVA %</label>
                      <select 
                        value={product.vatRate} 
                        onChange={e => updateProduct(product.id, 'vatRate', parseFloat(e.target.value))}
                        className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white outline-none text-white"
                      >
                        <option value={19}>19%</option>
                        <option value={13}>13%</option>
                        <option value={7}>7%</option>
                        <option value={0}>0%</option>
                      </select>
                    </div>
                    <div className="col-span-1 flex items-end justify-center pb-1.5">
                      <button 
                        onClick={() => removeProduct(product.id)}
                        className="text-neutral-600 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Notes Section */}
            <section className="bg-neutral-900 rounded-2xl shadow-sm border border-neutral-800 overflow-hidden">
              <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
                <h2 className="font-semibold text-white">Notes de Livraison</h2>
              </div>
              <div className="p-6">
                <textarea 
                  rows={3}
                  value={order.notes}
                  onChange={e => setOrder({...order, notes: e.target.value})}
                  placeholder="Instructions pour le livreur..."
                  className="w-full px-4 py-2 bg-black border border-neutral-800 rounded-lg focus:ring-2 focus:ring-white outline-none transition-all resize-none text-white"
                />
              </div>
            </section>
          </div>

          {/* Preview Side (Sticky) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest px-2">Aperçu Facture Drop.TN</h2>
              
              <div className="bg-white rounded-xl shadow-2xl border border-neutral-800 overflow-hidden aspect-[1/1.414] flex flex-col p-8 text-[10px] leading-relaxed text-black">
                {/* PDF Preview Mockup */}
                <div className="flex justify-between items-start mb-8">
                  <div className="w-24 h-12 bg-neutral-100 rounded flex items-center justify-center overflow-hidden">
                    {company.logo ? <img src={company.logo} alt="Logo" className="max-h-full" /> : <span className="text-neutral-400 font-bold">DROP.TN</span>}
                  </div>
                  <div className="text-right text-neutral-500">
                    <p className="font-bold text-black">{company.name}</p>
                    <p>{company.address}</p>
                    <p>{company.zipCode} {company.city}</p>
                    <p>{company.siret}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-bold text-black mb-4 tracking-tighter">FACTURE DROP.TN</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-neutral-400 mb-1">Client :</p>
                      <p className="font-bold text-black">{client.firstName} {client.lastName}</p>
                      <p className="text-neutral-600">{client.address}</p>
                      <p className="text-neutral-600">{client.city}, {client.gouvernorat}</p>
                    </div>
                    <div className="text-right">
                      <p><span className="text-neutral-400">Commande:</span> {order.number}</p>
                      <p><span className="text-neutral-400">Date:</span> {format(new Date(order.date), 'dd/MM/yyyy')}</p>
                      <p><span className="text-neutral-400">Paiement:</span> {order.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-black text-left">
                        <th className="py-2">Article</th>
                        <th className="py-2 text-center">Qté</th>
                        <th className="py-2 text-right">Prix HT</th>
                        <th className="py-2 text-right">Total HT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} className="border-b border-neutral-100">
                          <td className="py-2 font-medium">{p.name || 'Casquette Caplori'}</td>
                          <td className="py-2 text-center">{p.quantity}</td>
                          <td className="py-2 text-right">{p.unitPrice.toFixed(2)} TND</td>
                          <td className="py-2 text-right">{(p.quantity * p.unitPrice).toFixed(2)} TND</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 pt-4 border-t-2 border-neutral-100">
                  <div className="flex justify-end gap-8">
                    <div className="space-y-1 text-right text-neutral-500">
                      <p>Sous-total HT</p>
                      <p>TVA ({products[0]?.vatRate || 19}%)</p>
                      <p>Livraison</p>
                      <p className="text-sm font-bold text-black pt-2">TOTAL À PAYER</p>
                    </div>
                    <div className="space-y-1 text-right font-medium">
                      <p>{subtotalHT.toFixed(2)} TND</p>
                      <p>{totalVAT.toFixed(2)} TND</p>
                      <p>{order.shippingFee.toFixed(2)} TND</p>
                      <p className="text-sm font-bold text-black pt-2">{totalTTC.toFixed(2)} TND</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8 text-[8px] text-neutral-400 text-center border-t border-neutral-100">
                  <p>{company.name} • {company.siret} • {company.email}</p>
                  <p className="mt-1">Merci d'avoir choisi le streetwear tunisien premium.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 text-black shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2">Prêt pour l'envoi ?</h3>
                  <p className="text-neutral-600 text-sm mb-4">Générez le PDF pour l'inclure dans le colis ou l'envoyer par WhatsApp.</p>
                  <button 
                    onClick={generatePDF}
                    className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Télécharger PDF (TND)
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5">
                  <ShoppingCart className="w-32 h-32" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
