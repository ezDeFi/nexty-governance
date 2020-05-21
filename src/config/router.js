import HomePage from '@/module/page/home/Container'
import DashboardPage from '@/module/page/dashboard/Container'
import PortalPage from '@/module/page/portal/Container'
import DepositPage from '@/module/page/deposit/Container'
import WithdrawPage from '@/module/page/withdraw/Container'
import ManagePage from '@/module/page/manage/Container'
import TransferPage from '@/module/page/transfer/Container'
import UserControlPage from '@/module/page/usercontrol/Container'
import PoolControlPage from '@/module/page/poolcontrol/Container'
import PoolMakerPage from '@/module/page/poolmaker/Container'



import LoginPage from '@/module/page/login/Container'

import NotFound from '@/module/page/error/NotFound'

export default [
  {
    path: '/',
    page: PortalPage
  },
  {
    path: '/home',
    page: LoginPage
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
    path: '/manage',
    page: ManagePage
  },
  {
    path: '/transfer',
    page: TransferPage
  },
  {
    path: '/pool',
    page: UserControlPage
  },
  {
    path: '/portal',
    page: PortalPage
  },
  {
    path: '/poolcontrol',
    page: PoolControlPage
  },
  {
    path: '/poolmaker',
    page: PoolMakerPage
  },
  {
    page: NotFound
  }
]
