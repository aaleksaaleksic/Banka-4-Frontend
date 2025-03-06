'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { useHttpClient } from '@/context/HttpClientContext';
import { useBreadcrumb } from '@/context/BreadcrumbContext';
import GuardBlock from '@/components/GuardBlock';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { searchEmployees } from '@/api/employee';
import { DataTable } from '@/components/dataTable/DataTable';
import { employeesColumns } from '@/ui/dataTables/employees/employeesColumns';
import useTablePageParams from '@/hooks/useTablePageParams';
import FilterBar from '@/components/filters/FilterBar';

interface EmployeeFilter {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
}

const employeeFilterKeyToName = (key: keyof EmployeeFilter): string => {
  switch (key) {
    case 'firstName':
      return 'first name';
    case 'lastName':
      return 'last name';
    case 'email':
      return 'email';
    case 'position':
      return 'position';
  }
};

const EmployeeOverviewPage: React.FC = () => {
  const { page, pageSize, setPage, setPageSize } = useTablePageParams(
    'employees',
    { pageSize: 8, page: 0 }
  );

  const [searchFilter, setSearchFilter] = useState<EmployeeFilter>({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
  });

  const router = useRouter();

  const client = useHttpClient();

  const { data, isLoading } = useQuery({
    queryKey: ['employee', page, pageSize, searchFilter],
    queryFn: async () => {
      const response = await searchEmployees(
        client,
        searchFilter,
        pageSize,
        page
      );
      return response.data;
    },
  });

  const { dispatch } = useBreadcrumb();
  useEffect(() => {
    dispatch({
      type: 'SET_BREADCRUMB',
      items: [
        { title: 'Home', url: '/e' },
        { title: 'Employees', url: '/e/employee' },
        { title: 'Overview' },
      ],
    });
  }, [dispatch]);

  return (
    <GuardBlock requiredUserType={'employee'} requiredPrivileges={['ADMIN']}>
      <div className="p-8">
        <Card className="max-w-[900px] mx-auto">
          <CardHeader>
            <h1 className="text-2xl font-bold">Employees Overview</h1>
            <CardDescription>
              This table provides a clear and organized overview of key employee
              details for quick reference and easy access.
            </CardDescription>
            <FilterBar<EmployeeFilter>
              filterKeyToName={employeeFilterKeyToName}
              onSearch={(filter) => {
                setPage(0);
                setSearchFilter(filter);
              }}
              filter={searchFilter}
            />
          </CardHeader>
          <CardContent className="rounded-lg overflow-hidden">
            <DataTable
              onRowClick={(row) =>
                router.push(`/e/employee/${row.original.id}/edit`)
              }
              columns={employeesColumns}
              data={data?.content ?? []}
              isLoading={isLoading}
              pageCount={data?.page.totalPages ?? 0}
              pagination={{ page: page, pageSize }}
              onPaginationChange={(newPagination) => {
                setPage(newPagination.page);
                setPageSize(newPagination.pageSize);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </GuardBlock>
  );
};

export default EmployeeOverviewPage;
