'use client';

import Link from 'next/link';
import { ArrowUpRight, Users } from 'lucide-react';

const PKR = (val) => `Rs ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function RecentCustomersClient({ recentCustomers }) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant p-3 md:p-lg shadow-sm">
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h6 className="font-headline-md text-headline-md text-on-surface">Recent Customers</h6>
          <p className="text-body-sm text-on-surface-variant">Latest signups</p>
        </div>
        <Link href="/admin/customers" className="text-primary font-label-md hover:underline flex items-center gap-1">
          View All <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="space-y-3">
        {recentCustomers.length > 0 ? recentCustomers.map((customer) => (
          <div key={customer._id || customer.email} className="flex items-center justify-between p-sm rounded-lg hover:bg-surface-container-low transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold text-xs">
                {((customer.firstName?.[0] || '') + (customer.lastName?.[0] || '')).toUpperCase()}
              </div>
              <div>
                <p className="font-label-md text-on-surface">{customer.firstName} {customer.lastName || ''}</p>
                <p className="text-body-sm text-on-surface-variant truncate max-w-35">{customer.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-label-md text-on-surface">{customer.ordersCount || 0} orders</p>
              <p className="text-body-sm text-on-surface-variant">{PKR(customer.totalSpent || 0)}</p>
            </div>
          </div>
        )) : (
          <div className="text-center py-lg text-on-surface-variant">
            <Users size={24} className="mx-auto mb-2" />
            <p className="text-body-sm">No customers yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
