"use client";

import React from "react";
import BrandName from "./BrandName";
import { QRCodeSVG } from "qrcode.react";
import { toWords } from "number-to-words";
import Image from "next/image";

const HeaderContent = ({ profile, invoiceData }) => (
  <div
    className="border-b-4 pb-6 mb-8 flex justify-between items-end bg-white"
    style={{ borderColor: profile?.formatting?.color || "#1d4ed8" }}
  >
    <div className="w-1/2">
      <div className="flex items-center gap-4 mb-2">
        {profile?.logo ? (
          <Image
            src={profile.logo}
            width={150}
            height={64}
            unoptimized
            className="h-16 w-auto object-contain max-w-[150px]"
            alt="Logo"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
            Logo
          </div>
        )}
        <div>
          <BrandName name={profile?.name} color={profile?.formatting?.color} />
          {profile?.slogan && (
            <div className="text-[8px] text-gray-500 uppercase mt-1">
              {profile.slogan}
            </div>
          )}
          {profile?.tagline && (
            <div
              className="text-[10px] uppercase font-bold mt-1"
              style={{ color: profile?.formatting?.color || "#1d4ed8" }}
            >
              {profile.tagline}
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="w-1/2 flex flex-col items-end text-right">
      <div
        className="text-3xl font-bold mb-2"
        style={{ color: profile?.formatting?.color || "#1d4ed8" }}
      >
        INVOICE
      </div>
      <div className="text-xs text-gray-600 space-y-1 text-right">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 text-right">
          <span className="font-bold text-right">Invoice No:</span>
          <span className="text-left">{invoiceData?.invoiceNo}</span>

          <span className="font-bold text-right">Invoice Date:</span>
          <span className="text-left">
            {invoiceData?.date &&
              new Date(invoiceData.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
          </span>

          {invoiceData?.dueDate && (
            <>
              <span className="font-bold text-right">Due Date:</span>
              <span className="text-left">
                {new Date(invoiceData.dueDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);

const FooterContent = ({ profile, invoiceData, initialData }) => (
  <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-6 bg-white">
    <p className="font-semibold text-gray-700 mb-1">
      Thank you for your business!
    </p>
    <p className="mb-2">For any enquiries, please email {profile?.email}</p>

    {invoiceData?.type === "Digital" && (
      <p className="text-[10px] text-gray-400 italic mt-2">
        This is a computer generated invoice and doesn&#39;t need signature.
      </p>
    )}
  </div>
);

import { useWatch } from "react-hook-form";

// ... (Header/Footer components stay same, but I can't easily skip them in replace_file_content if I want to wrap the export)
// I'll replace the COMPONENT DEFINITION part mostly.

// ... imports ...

const InvoicePreviewContent = React.memo(({ profile, data, initialData }) => {
  // Calculations based on `data`
  const calculateSubTotal = () => {
    return (data?.items || []).reduce(
      (acc, item) => acc + (Number(item.rate) || 0) * (Number(item.qty) || 0),
      0,
    );
  };

  const calculateTax = () => {
    return calculateSubTotal() * ((data?.taxRate || 0) / 100);
  };

  const calculateTotal = () => {
    return calculateSubTotal() + calculateTax();
  };

  const amountInWords = (amount) => {
    try {
      return toWords(amount)
        .replace(/,/g, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    } catch (e) {
      return amount;
    }
  };

  if (!profile || !data) return null;

  return (
    <div className="bg-white shadow-lg mx-auto print:shadow-none print:w-full print:m-0 print:p-0 flex flex-col w-[210mm] min-h-[296mm] h-auto p-[40px] relative box-border print:min-h-0 print:h-auto">
      {/* Print Layout Structure */}
      <div className="hidden print:block fixed top-0 left-0 w-full px-10 py-0 z-50">
        <HeaderContent profile={profile} invoiceData={data} />
      </div>

      <div className="hidden print:block fixed bottom-0 left-0 w-full px-10 pb-0 z-50">
        <FooterContent
          profile={profile}
          invoiceData={data}
          initialData={initialData}
        />
      </div>

      <table className="w-full">
        <thead className="hidden print:table-header-group">
          <tr>
            <td>
              {/* Spacer for Fixed Header */}
              <div className="invisible px-10 py-0">
                <HeaderContent profile={profile} invoiceData={data} />
              </div>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className="px-10">
                {/* Screen Header */}
                <div className="print:hidden">
                  <HeaderContent profile={profile} invoiceData={data} />
                </div>

                {/* Addresses */}
                <div className="flex mb-8">
                  <div className="w-1/2 pr-4">
                    <div
                      className="text-xs font-bold uppercase mb-2"
                      style={{ color: profile.formatting?.color || "#1d4ed8" }}
                    >
                      Bill To (Client):
                    </div>
                    <div className="text-sm text-gray-800">
                      <div className="font-bold">
                        {data.clientName ||
                          data.clientCompany ||
                          "[Client/Company Name]"}
                      </div>
                      {data.clientName && data.clientCompany && (
                        <div>{data.clientCompany}</div>
                      )}
                      <div className="whitespace-pre-wrap">
                        {data.clientAddress || "[Address]"}
                      </div>
                      {data.clientGst && (
                        <div className="mt-1 text-xs text-gray-500">
                          GSTIN: {data.clientGst}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-1/2 pl-4 border-l border-gray-100">
                    <div
                      className="text-xs font-bold uppercase mb-2"
                      style={{ color: profile.formatting?.color || "#1d4ed8" }}
                    >
                      Bill From:
                    </div>
                    <div className="text-sm text-gray-800">
                      <div className="font-bold">
                        {profile.billingName || profile.name}
                      </div>
                      <div className="whitespace-pre-wrap">
                        {profile.address}
                      </div>
                      <div className="mt-2">Phone: {profile.phone}</div>
                      <div>Email: {profile.email}</div>
                      {profile.gstIn && <div>GSTIN: {profile.gstIn}</div>}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full border-collapse mb-8">
                  <thead>
                    <tr
                      className="text-white text-xs"
                      style={{
                        backgroundColor: profile.formatting?.color || "#1d4ed8",
                      }}
                    >
                      <th className="p-2 text-left w-12 border-b-2 border-blue-900">
                        #
                      </th>
                      <th className="p-2 text-left border-b-2 border-blue-900">
                        Description
                      </th>
                      <th className="p-2 text-right w-24 border-b-2 border-blue-900">
                        Rate
                      </th>
                      <th className="p-2 text-center w-12 border-b-2 border-blue-900">
                        Qty
                      </th>
                      <th className="p-2 text-right w-32 border-b-2 border-blue-900">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item, i) => (
                      <tr key={i} className="text-sm border-b border-gray-100">
                        <td className="p-3 text-gray-600">{i + 1}</td>
                        <td className="py-4 text-gray-800">
                          <div className="font-medium">{item.description}</div>
                          {item.subDescription && (
                            <div className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">
                              {item.subDescription}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right text-gray-600">
                          {Number(item.rate).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-3 text-center text-gray-600">
                          {item.qty}
                        </td>
                        <td className="p-3 text-right font-bold text-gray-800">
                          {(Number(item.rate) * Number(item.qty)).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={5} className="h-4"></td>
                    </tr>
                    <tr>
                      <td colSpan={3}></td>
                      <td className="p-2 text-right text-xs font-bold text-gray-600">
                        Sub Total
                      </td>
                      <td className="p-2 text-right text-sm font-bold text-gray-800">
                        {calculateSubTotal().toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3}></td>
                      <td className="p-2 text-right text-xs font-bold text-gray-600">
                        GST ({data.taxRate}%)
                      </td>
                      <td className="p-2 text-right text-sm font-bold text-gray-800">
                        {calculateTax().toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td colSpan={3} className="p-3">
                        <div
                          className="text-[10px] font-bold uppercase"
                          style={{
                            color: profile.formatting?.color || "#1d4ed8",
                          }}
                        >
                          Amount in Words:
                        </div>
                        <div className="text-xs italic text-gray-600">
                          {amountInWords(calculateTotal())} Rupees Only
                        </div>
                      </td>
                      <td
                        className="p-3 text-right text-base font-bold border-t border-blue-200"
                        style={{
                          color: profile.formatting?.color || "#1d4ed8",
                        }}
                      >
                        TOTAL
                      </td>
                      <td
                        className="p-3 text-right text-base font-bold border-t border-blue-200"
                        style={{
                          color: profile.formatting?.color || "#1d4ed8",
                        }}
                      >
                        ₹{" "}
                        {calculateTotal().toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-start">
                  <div className="w-3/5">
                    <div
                      className="text-xs font-bold uppercase mb-2"
                      style={{
                        color: profile.formatting?.color || "#1d4ed8",
                      }}
                    >
                      BANK DETAILS:
                    </div>
                    <div className="bg-yellow-50 border border-dashed border-yellow-400 rounded-lg p-4 text-xs print:border-gray-600">
                      <div className="grid grid-cols-[80px_1fr] gap-y-1">
                        <span className="font-bold text-gray-700">Bank:</span>
                        <span className="text-gray-800">
                          {profile.bankDetails?.bankName}
                        </span>

                        <span className="font-bold text-gray-700">
                          Account:
                        </span>
                        <span className="text-gray-800">
                          {profile.bankDetails?.accountName}
                        </span>

                        <span className="font-bold text-gray-700">Acc No:</span>
                        <span className="text-gray-800">
                          {profile.bankDetails?.accountNumber}
                        </span>

                        <span className="font-bold text-gray-700">IFSC:</span>
                        <span className="text-gray-800">
                          {profile.bankDetails?.ifscCode}
                        </span>

                        <span className="font-bold text-gray-700">PAN No:</span>
                        <span className="text-gray-800">{profile.pan}</span>
                      </div>
                    </div>

                    {/* Optional QR Code for Standard Invoice */}
                    {data.type === "Standard" &&
                      data.showQrCode && (
                        <div className="mt-4">
                          <QRCodeSVG
                            value={`${typeof window !== "undefined" ? window.location.origin : ""}/verify/${initialData?._id || "preview"}`}
                            size={60}
                            level="H"
                          />
                          <div className="text-[9px] text-gray-500 mt-1 max-w-[120px] leading-tight">
                            Scan to verify
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="text-right flex flex-col items-end">
                    {data.type === "Digital" ? (
                      <div className="flex flex-col items-end">
                        <div className="mb-2 p-2 bg-white border border-gray-200 rounded-lg">
                          <QRCodeSVG
                            value={`${typeof window !== "undefined" ? window.location.origin : ""}/verify/${initialData?._id || "preview"}`}
                            size={80}
                            level="H"
                          />
                        </div>
                        <div className="text-[10px] text-gray-500 max-w-[150px] leading-tight">
                          Digitally Verified. Scan to authenticate.
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="text-sm font-bold mb-24"
                          style={{
                            color: profile.formatting?.color || "#1d4ed8",
                            fontFamily: "Verdana, sans-serif",
                          }}
                        >
                          For {profile.billingName || profile.name}
                        </div>
                        <div
                          className="text-[10px] font-bold uppercase border-t pt-1 min-w-[150px] text-center text-gray-500"
                          style={{
                            borderColor: profile.formatting?.color || "#1d4ed8",
                          }}
                        >
                          Authorized Signatory
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Screen Footer */}
                <div className="print:hidden">
                  <FooterContent
                    profile={profile}
                    invoiceData={data}
                    initialData={initialData}
                  />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot className="hidden print:table-footer-group">
          <tr>
            <td>
              {/* Spacer for Fixed Footer */}
              <div className="invisible px-10 pb-6">
                <FooterContent
                  profile={profile}
                  invoiceData={data}
                  initialData={initialData}
                />
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
});

// Connected Component (Live Mode)
const InvoicePreviewLive = ({ control, invoiceData, ...props }) => {
  const watchedData = useWatch({ control });
  // Merge watched data with initial data to ensure structure
  const data = watchedData ? { ...invoiceData, ...watchedData } : invoiceData;
  return <InvoicePreviewContent data={data} {...props} />;
};

// Main Component Wrapper
const InvoicePreview = React.memo(({ control, invoiceData, ...props }) => {
  if (control) {
    return <InvoicePreviewLive control={control} invoiceData={invoiceData} {...props} />;
  }
  return <InvoicePreviewContent data={invoiceData} {...props} />;
});

InvoicePreview.displayName = "InvoicePreview";
InvoicePreviewContent.displayName = "InvoicePreviewContent";

export default InvoicePreview;
