'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import Button from '../../../../../_components/Admin/Button';
import { 
  MdArrowBack, 
  MdCheck, 
  MdEdit, 
  MdLocalShipping, 
  MdCreditCard 
} from 'react-icons/md';

const OrderDetailPage = () => {
  return (
    <>

      {/* Main Content Canvas */}
      <main className="pt-4 px-margin-desktop pb-20">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  className="text-primary hover:underline flex items-center gap-1 font-body-sm text-body-sm"
                  href="/admin/orders"
                >
                  <MdArrowBack size={16} />
                  Back to Orders
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <h2 className="font-headline-lg text-headline-lg font-black">Order #1042-88</h2>
                <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant font-label-md text-label-md rounded">
                  Partially Paid
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                October 24, 2023 at 2:14 PM from Online Store
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                Archive
              </Button>
              <Button variant="primary" size="sm">
                Print Invoice
              </Button>
            </div>
          </div>

          {/* Bento Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
            {/* Left Column (8 cols) */}
            <div className="lg:col-span-8 space-y-lg">
              {/* Order Items Card */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded overflow-hidden">
                <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                  <h3 className="font-headline-md text-headline-md">Order items</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body-md text-body-md">
                    <thead>
                      <tr className="bg-surface-container-low/50">
                        <th className="p-4 font-label-md text-label-md text-on-surface-variant">Product</th>
                        <th className="p-4 font-label-md text-label-md text-on-surface-variant">SKU</th>
                        <th className="p-4 font-label-md text-label-md text-on-surface-variant">Price</th>
                        <th className="p-4 font-label-md text-label-md text-on-surface-variant">Quantity</th>
                        <th className="p-4 text-right font-label-md text-label-md text-on-surface-variant">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <Image
                              className="rounded object-cover border border-outline-variant"
                              alt="Aero-Step Performance Sneakers product photo"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbpa_CJKyAYvnYymYaw_650kURVN7bICDOKUeiHQtC5Dm7HsfUxT-nbTjIsckPerBomEEt1dR2oxYb-RwEZP61y8xJX3srY0uWihBKMx5fPgRMlJ7INefF6PqUGaqNAnErPghIQSjfKpq_hBk73Qp1obcX5e16SrlJCd6IU75YnVIx0awuxuQ15waxLrm6C3n89Xf14my6yOtiFmsAiizIL0PFRjQoDK4lTxwaapTlekiS4GjOOiC8fPdzMR3fgSv3RKZniRGhVX05"
                              width={48}
                              height={48}
                            />
                            <div>
                              <p className="font-bold">Aero-Step Performance Sneakers</p>
                              <p className="text-body-sm text-on-surface-variant">Size: 42, Color: Crimson Red</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-on-surface-variant">SHOE-ASP-42-RED</td>
                        <td className="p-4">Rs 129.00</td>
                        <td className="p-4">1</td>
                        <td className="p-4 text-right font-bold">Rs 129.00</td>
                      </tr>
                      <tr className="hover:bg-surface-container-low transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <Image
                              className="rounded object-cover border border-outline-variant"
                              alt="Nomad Classic Wristwatch product photo"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh9Nb6oXsKxzyyI2Dprc7RJO1IPngcAOMOafaCEVCla46yI64U73DuwIR72C3ZpycXocKZUVd831G7Zyo3yXewj7AmsaBxhkrcVi4OVSA4YCj3lUh0lAzrfUEsVFOPHh3nLrQbT6sDfLp0W-96lrdiyMb5DkTsHfyUEv_ejdoiQAnA8WkcBUt7EdU7JqdJGkNe-9nqTM9asAiyESYjIitaYqcaR59ycVrGXiGXR-P0YmFF-BshWY1WKdhn8Zaun35S5v9VvFTYuByV"
                              width={48}
                              height={48}
                            />
                            <div>
                              <p className="font-bold">Nomad Classic Wristwatch</p>
                              <p className="text-body-sm text-on-surface-variant">Strap: Tan Leather</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-on-surface-variant">WTCH-NMD-TAN</td>
                        <td className="p-4">Rs 85.00</td>
                        <td className="p-4">2</td>
                        <td className="p-4 text-right font-bold">Rs 170.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded p-lg">
                <h3 className="font-headline-md text-headline-md mb-6">Order timeline</h3>
                <div className="relative">
                  <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-outline-variant"></div>
                  <div className="space-y-8">
                    {/* Step 1 */}
                    <div className="relative flex items-start pl-8">
                        <MdCheck size={14} className="text-on-primary" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold">Order placed</p>
                          <p className="text-body-sm text-on-surface-variant">Oct 24, 2:14 PM</p>
                        </div>
                        <p className="text-body-sm text-on-surface-variant">
                          Customer placed an order via the Online Store.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative flex items-start pl-8">
                        <MdCheck size={14} className="text-on-primary" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold">Payment processed</p>
                          <p className="text-body-sm text-on-surface-variant">Oct 24, 2:15 PM</p>
                        </div>
                        <p className="text-body-sm text-on-surface-variant">
                          Transaction approved by Stripe. Total Rs 299.00.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 (Active/Current) */}
                    <div className="relative flex items-start pl-8">
                      <div className="absolute left-0 w-6 h-6 rounded-full border-2 border-primary bg-surface-container-lowest flex items-center justify-center z-10">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-primary">Pending fulfillment</p>
                          <p className="text-body-sm text-on-surface-variant">Current</p>
                        </div>
                        <p className="text-body-sm text-on-surface-variant">
                          The order is ready to be picked and packed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded p-lg">
                <h3 className="font-headline-md text-headline-md mb-4">Notes</h3>
                <textarea
                  className="w-full h-32 p-3 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded font-body-md text-body-md"
                  placeholder="Add a note to this order..."
                ></textarea>
                <div className="flex justify-end mt-4">
                  <button className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity rounded active:scale-[0.98]">
                    Save Note
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-lg">
              {/* Fulfillment Card */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded p-lg">
                <h3 className="font-headline-md text-headline-md mb-4">Fulfillment</h3>
                <p className="text-body-sm text-on-surface-variant mb-6">
                  2 of 2 items are unfulfilled. Prepare the items for shipping.
                </p>
                <div className="space-y-3">
                  <button className="w-full py-3 bg-primary text-on-primary font-bold text-body-md hover:opacity-90 transition-opacity rounded shadow-sm active:scale-[0.98]">
                    Mark as Fulfilled
                  </button>
                  <button className="w-full py-3 border border-error text-error font-bold text-body-md hover:bg-error-container/10 transition-colors rounded active:scale-[0.98]">
                    Refund
                  </button>
                </div>
              </div>

              {/* Customer Card */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded p-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-headline-md text-headline-md">Customer</h3>
                  <Link className="text-primary font-label-md text-label-md hover:underline" href="#">
                    Edit
                  </Link>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-secondary">
                    JH
                  </div>
                  <div>
                    <p className="font-bold">Jonathan Higgins</p>
                    <p className="text-body-sm text-on-surface-variant">8 orders</p>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-outline-variant">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Email</p>
                    <p className="font-body-md text-body-md text-primary">j.higgins@example.com</p>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Phone</p>
                    <p className="font-body-md text-body-md">+1 (555) 0123-4567</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded p-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-headline-md text-headline-md">Shipping Address</h3>
                  <MdEdit className="text-on-surface-variant cursor-pointer" size={18} />
                </div>
                <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  <p>Jonathan Higgins</p>
                  <p>1248 Oakwood Avenue</p>
                  <p>Apartment 4B</p>
                  <p>Seattle, WA 98101</p>
                  <p>United States</p>
                </div>
                <div className="mt-4 pt-4 border-t border-outline-variant">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <MdLocalShipping size={18} />
                    <p className="font-body-sm text-body-sm">Standard Shipping (3-5 business days)</p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded p-lg">
                <h3 className="font-headline-md text-headline-md mb-4">Payment Summary</h3>
                <div className="space-y-3 font-body-md text-body-md">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span>Rs 299.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Shipping</span>
                    <span>Rs 0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Tax</span>
                    <span>Rs 0.00</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-outline-variant font-bold">
                    <span>Total</span>
                    <span>Rs 299.00</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3 p-3 bg-surface-container-low rounded">
                  <MdCreditCard className="text-primary" size={20} />
                  <div>
                    <p className="font-label-md text-label-md">Paid via Mastercard</p>
                    <p className="text-body-sm text-on-surface-variant">ending in 4422</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Shell */}
      <footer className="ml-60 bg-surface-container-lowest border-t border-outline-variant w-[calc(100%-240px)] py-lg mt-12">
        <div className="max-w-[1200px] mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
            MERCHANT ADMIN SYSTEM
          </div>
          <div className="flex gap-lg font-body-sm text-body-sm text-on-surface-variant">
            <Link className="hover:text-primary transition-colors" href="#">
              Privacy Policy
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              Terms of Service
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              Shipping Info
            </Link>
            <Link className="hover:text-primary transition-colors" href="#">
              Contact Us
            </Link>
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            © 2024 Multi-Tenant eCommerce Platform.
          </div>
        </div>
      </footer>
    </>
  );
};

export default OrderDetailPage;