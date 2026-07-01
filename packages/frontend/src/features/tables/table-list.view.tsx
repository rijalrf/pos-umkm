import React, { useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Typography, Card, Dropdown, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined, QrcodeOutlined, PrinterOutlined } from '@ant-design/icons';
import { useTablePresenter, TableItem } from './table.presenter';
import { ConfirmModal } from '../../components/common/confirm-modal.component';
import { QRCodeSVG } from 'qrcode.react';

const { Title, Paragraph, Text } = Typography;

export const TableListView: React.FC = () => {
  const presenter = useTablePresenter();
  const [form] = Form.useForm();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [tableIdToDelete, setTableIdToDelete] = React.useState<string | null>(null);

  // Handle setting initial values when editing
  useEffect(() => {
    if (presenter.editingId && presenter.isModalOpen) {
      const editingTable = presenter.tables.find(t => t.id === presenter.editingId);
      if (editingTable) {
        form.setFieldsValue({
          number: editingTable.number,
          status: editingTable.status,
        });
      }
    } else {
      form.resetFields();
    }
  }, [presenter.editingId, presenter.isModalOpen, presenter.tables, form]);

  const handleFormFinish = async (values: any) => {
    let success = false;
    if (presenter.editingId) {
      success = await presenter.handleUpdate(presenter.editingId, values);
    } else {
      success = await presenter.handleCreate(values);
    }
    if (success) {
      form.resetFields();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const menuActions = (record: TableItem) => [
    {
      key: 'qr',
      label: 'Tampilkan QR Code',
      icon: <QrcodeOutlined />,
      onClick: () => presenter.handleOpenQrModal(record),
    },
    {
      key: 'edit',
      label: 'Edit Meja',
      icon: <EditOutlined />,
      onClick: () => presenter.handleOpenEditModal(record),
    },
    {
      key: 'delete',
      label: 'Hapus Meja',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        setTableIdToDelete(record.id);
        setDeleteConfirmOpen(true);
      },
    },
  ];

  const columns = [
    {
      title: 'Kode',
      dataIndex: 'code',
      key: 'code',
      width: 80,
      render: (code: string) => (
        <Text
          strong
          style={{
            color: '#C2410C',
            fontFamily: "'Source Code Pro', monospace",
            fontSize: '15px',
            letterSpacing: '0.05em',
          }}
        >
          {code}
        </Text>
      ),
    },
    {
      title: 'Nomor / Nama Meja',
      dataIndex: 'number',
      key: 'number',
      render: (text: string) => <Text strong style={{ color: '#1C1917' }}>{text}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'ACTIVE' | 'INACTIVE') => {
        const color = status === 'ACTIVE' ? 'green' : 'red';
        const label = status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Tanggal Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 100,
      render: (_: any, record: TableItem) => (
        <Dropdown menu={{ items: menuActions(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: '18px' }} />} />
        </Dropdown>
      ),
    },
  ];

  const qrUrl = presenter.selectedTable 
    ? `${window.location.origin}/customer/t/${presenter.selectedTable.id}`
    : '';

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      {/* CSS Khusus untuk Mode Cetak QR Code */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
            background: none !important;
          }
          #qr-print-card, #qr-print-card * {
            visibility: visible !important;
          }
          #qr-print-card {
            position: absolute !important;
            left: 50% !important;
            top: 40% !important;
            transform: translate(-50%, -50%) !important;
            width: 320px !important;
            border: 2px dashed #C2410C !important;
            border-radius: 8px !important;
            padding: 24px !important;
            text-align: center !important;
            box-shadow: none !important;
            background-color: #FFFFFF !important;
          }
          .ant-modal-wrap, .ant-modal-mask, .ant-modal-root {
            background: none !important;
          }
          .ant-modal {
            top: 0 !important;
            left: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <Card 
        style={{ borderColor: '#E7E5E4', borderRadius: '8px' }} 
        styles={{ body: { padding: '24px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Title level={3} style={{ margin: 0, fontFamily: 'var(--font-headline)', color: '#1C1917' }}>
              Master Meja
            </Title>
            <Paragraph style={{ margin: '4px 0 0 0', color: '#57534E' }}>
              Kelola nomor meja fisik dan buat QR Code untuk pemesanan mandiri pelanggan.
            </Paragraph>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={presenter.handleOpenAddModal}
            style={{
              backgroundColor: '#C2410C',
              borderColor: '#C2410C',
              borderRadius: '4px',
              fontWeight: 600,
              height: '40px',
            }}
          >
            Tambah Meja
          </Button>
        </div>

        {/* Pencarian dan Filter */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Input.Search
            placeholder="Cari nomor meja..."
            allowClear
            value={presenter.search}
            onChange={(e) => presenter.setSearch(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
        </div>

        {/* Tabel Data Meja */}
        <Table
          columns={columns}
          dataSource={presenter.tables}
          rowKey="id"
          loading={presenter.loading}
          pagination={{ pageSize: 10 }}
          bordered
          style={{ background: '#FFFFFF' }}
        />
      </Card>

      {/* Modal Tambah / Edit Meja */}
      <Modal
        title={presenter.editingId ? 'Edit Meja' : 'Tambah Meja Baru'}
        open={presenter.isModalOpen}
        onCancel={presenter.handleCloseModal}
        footer={null}
        width={420}
        destroyOnClose
        centered
        styles={{
          header: { borderBottom: '1px solid #E7E5E4', paddingBottom: '12px' },
          body: { paddingTop: '16px' }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormFinish}
          requiredMark={false}
          initialValues={{ status: 'ACTIVE' }}
        >
          <Form.Item
            label="Nomor / Nama Meja"
            name="number"
            rules={[
              { required: true, message: 'Masukkan nomor atau nama meja!' },
              { max: 50, message: 'Nama meja terlalu panjang (maksimal 50 karakter)' }
            ]}
          >
            <Input placeholder="Contoh: Meja 01, Meja Lesehan A" style={{ height: '40px', borderRadius: '4px' }} />
          </Form.Item>

          <Form.Item
            label="Status Meja"
            name="status"
            rules={[{ required: true }]}
          >
            <Input.Search
              style={{ display: 'none' }} // dummy
            />
            {/* Menggunakan select bawaan antd agar lebih user friendly */}
            <select 
              name="status"
              className="ant-input" 
              style={{ 
                height: '40px', 
                borderRadius: '4px', 
                width: '100%',
                padding: '0 11px',
                border: '1.5px solid #D6D3D1',
                backgroundColor: '#FFFFFF'
              }}
              onChange={(e) => form.setFieldValue('status', e.target.value)}
              value={form.getFieldValue('status')}
            >
              <option value="ACTIVE">Aktif (Dapat Dipesan)</option>
              <option value="INACTIVE">Tidak Aktif</option>
            </select>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid #E7E5E4', paddingTop: '16px' }}>
            <Button onClick={presenter.handleCloseModal} style={{ borderRadius: '4px', height: '38px' }}>
              Batal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={presenter.submitLoading}
              style={{
                backgroundColor: '#C2410C',
                borderColor: '#C2410C',
                borderRadius: '4px',
                fontWeight: 600,
                height: '38px',
              }}
            >
              Simpan
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Cetak/Tampilkan QR Code */}
      <Modal
        title="QR Code Pemesanan Meja"
        open={presenter.isQrModalOpen}
        onCancel={presenter.handleCloseQrModal}
        footer={[
          <Button key="back" onClick={presenter.handleCloseQrModal} style={{ borderRadius: '4px' }}>
            Tutup
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            style={{ backgroundColor: '#C2410C', borderColor: '#C2410C', borderRadius: '4px', fontWeight: 600 }}
          >
            Cetak QR Code
          </Button>
        ]}
        width={380}
        centered
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
          {presenter.selectedTable && (
            <div 
              id="qr-print-card"
              style={{
                width: '100%',
                border: '1.5px solid #D6D3D1',
                borderRadius: '8px',
                padding: '24px 16px',
                textAlign: 'center',
                backgroundColor: '#FFFBF5',
              }}
            >
              <Title level={4} style={{ color: '#C2410C', margin: '0 0 4px 0', fontFamily: 'var(--font-headline)' }}>
                SILAKAN PESAN DI SINI
              </Title>
              <Paragraph style={{ fontSize: '12px', color: '#57534E', marginBottom: '16px' }}>
                Scan QR Code untuk memesan menu langsung dari HP Anda
              </Paragraph>
              
              <div style={{ 
                background: '#FFFFFF', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid #E7E5E4',
                display: 'inline-block',
                marginBottom: '16px'
              }}>
                <QRCodeSVG value={qrUrl} size={180} includeMargin={true} />
              </div>
              
              <Title
                level={2}
                style={{
                  margin: '0 4px 2px 0',
                  color: '#C2410C',
                  fontFamily: "'Source Code Pro', monospace",
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  fontSize: '32px',
                }}
              >
                {presenter.selectedTable.code}
              </Title>
              <Text style={{ color: '#57534E', fontSize: '13px', display: 'block', marginBottom: '12px' }}>
                {presenter.selectedTable.number}
              </Text>
              
              <div style={{ borderTop: '1px dashed #D6D3D1', paddingTop: '12px', textAlign: 'left' }}>
                <Text strong style={{ fontSize: '11px', color: '#1C1917', display: 'block', marginBottom: '4px', textAlign: 'center' }}>
                  Langkah Pemesanan:
                </Text>
                <Paragraph style={{ fontSize: '10px', color: '#57534E', margin: 0, lineHeight: 1.4 }}>
                  1. Pindai QR Code di atas menggunakan kamera HP Anda.<br />
                  2. Pilih menu makanan/minuman yang Anda inginkan.<br />
                  3. Isi Nama Anda dan konfirmasi pesanan Anda.<br />
                  4. Bayar di kasir, hidangan lezat akan segera diantar ke meja Anda!
                </Paragraph>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmModal
        open={deleteConfirmOpen}
        title="Hapus Meja"
        description="Apakah Anda yakin ingin menghapus meja ini? Transaksi yang sudah terlanjur dikaitkan dengan meja ini akan tetap tersimpan tetapi nomor meja pada riwayat transaksi tidak akan hilang."
        onConfirm={async () => {
          if (tableIdToDelete) {
            const success = await presenter.handleDelete(tableIdToDelete);
            if (success) {
              setDeleteConfirmOpen(false);
              setTableIdToDelete(null);
            }
          }
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTableIdToDelete(null);
        }}
        confirmLoading={presenter.deleteLoading}
      />
    </div>
  );
};
