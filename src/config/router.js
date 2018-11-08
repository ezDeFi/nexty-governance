import HomePage from '@/module/page/home/Container'
import DashboardPage from '@/module/page/dashboard/Container'
import DepositPage from '@/module/page/deposit/Container'
import WithdrawPage from '@/module/page/withdraw/Container'
import ManagerPage from '@/module/page/manager/Container'
import TransferPage from '@/module/page/transfer/Container'

import LoginPage from '@/module/page/login/Container'

import NotFound from '@/module/page/error/NotFound'

export default [
  {
    path: '/',
    page: HomePage
  },
  {
    path: '/home',
    page: HomePage
  },
  {
    path: '/dashboard',
    page: DashboardPage
  },
  {
    path: '/login',
    page: LoginPage
  },
  {
    path: '/deposit',
    page: DepositPage
  },
  {
    path: '/withdraw',
    page: WithdrawPage
  },
  {
    path: '/manager',
    page: ManagerPage
  },
  {
    path: '/transfer',
    page: TransferPage
  },
  {
    page: NotFound
  }
]
