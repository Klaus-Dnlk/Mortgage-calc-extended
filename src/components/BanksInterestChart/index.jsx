import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { banksSelectors } from '../../redux/banks';
import { safeGet } from '../../utils/lodash-utils';

/**
 * Data visualization (Recharts) — interest rate comparison for banks.
 * Senior competency: chart library, map domain data → chart series, responsive container.
 */
const BanksInterestChart = () => {
  const banks = useSelector(banksSelectors.getAllBanks);

  const chartData = useMemo(() => {
    if (!banks || banks.length === 0) return [];
    return banks.map((bank) => ({
      name: String(safeGet(bank, 'BankName', 'Bank')).slice(0, 12),
      interestRate: Number(safeGet(bank, 'InterestRate', 0)) || 0,
      maxLoan: Number(safeGet(bank, 'MaximumLoan', 0)) || 0,
    }));
  }, [banks]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Interest rates by bank
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Recharts bar chart — rates from Redux bank list
        </Typography>
        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 0, bottom: 24 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                label={{ value: 'Rate %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value, key) =>
                  key === 'interestRate'
                    ? [`${value}%`, 'Interest rate']
                    : [value, key]
                }
              />
              <Legend />
              <Bar dataKey="interestRate" name="Interest rate %" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BanksInterestChart;
