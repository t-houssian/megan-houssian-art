import InquirySuccess from '../../components/InquirySuccess';

export const metadata = { title: 'Commission Request Sent | Megan Houssian Art', robots: { index: false, follow: false } };

export default function CommissionSuccessPage() {
  return <InquirySuccess type="commission" />;
}
