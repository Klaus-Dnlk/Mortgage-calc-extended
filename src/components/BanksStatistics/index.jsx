import React from 'react';
import { useSelector } from 'react-redux';
import { banksSelectors } from '../../redux/banks';
import { formatCurrency, formatPercentage, safeGet } from '../../utils/lodash-utils';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  TrendingUp as RateIcon,
  Schedule as TermIcon,
  AttachMoney as LoanIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

const BanksStatistics = () => {
  const statistics = useSelector(banksSelectors.getBanksStatistics);
  const banks = useSelector(banksSelectors.getAllBanks);

  if (!banks || banks.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="textSecondary">
            No banks data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      title: 'Total Banks',
      value: safeGet(statistics, 'totalBanks', 0),
      icon: <BankIcon />,
      color: 'primary',
      formatter: (value) => value.toString()
    },
    {
      title: 'Avg Interest Rate',
      value: safeGet(statistics, 'averageInterestRate', 0),
      icon: <RateIcon />,
      color: 'success',
      formatter: formatPercentage
    },
    {
      title: 'Avg Loan Term',
      value: safeGet(statistics, 'averageLoanTerm', 0),
      icon: <TermIcon />,
      color: 'info',
      formatter: (value) => `${value} years`
    },
    {
      title: 'Avg Max Loan',
      value: safeGet(statistics, 'averageMaxLoan', 0),
      icon: <LoanIcon />,
      color: 'warning',
      formatter: formatCurrency
    },
    {
      title: 'Avg Min Down Payment',
      value: safeGet(statistics, 'averageMinDownPayment', 0),
      icon: <PaymentIcon />,
      color: 'secondary',
      formatter: formatCurrency
    }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Banks Statistics
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Calculated using Immutable.js and Lodash for optimal performance
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {statItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ mr: 1, color: `${item.color}.main` }}>
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {item.title}
                  </Typography>
                  <Typography variant="h6" color="textPrimary">
                    {item.formatter(item.value)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          <Chip
            label="Powered by Immutable.js & Lodash"
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BanksStatistics; 