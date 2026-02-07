"use client";

export default function CompanyFooter({ profile }) {
  return (
    <div className="footer-fixed-container pt-2 border-t-2 border-blue-500 text-xs text-gray-500 text-center h-[80px] flex flex-col justify-end pb-1 box-border w-full">
      <div className="flex justify-between gap-40 mb-0 text-left">
        <div>
          <h4
            className="font-bold uppercase text-gray-800 mb-1"
            style={{ color: profile.formatting?.color }}
          >
            Registered Office
          </h4>
          <p className="whitespace-pre-line leading-relaxed">
            {profile?.address}
          </p>
        </div>
        <div>
          <h4
            className="font-bold uppercase text-gray-800 mb-1"
            style={{ color: profile.formatting?.color }}
          >
            Registration
          </h4>
          {profile?.registrationNo ? <p>
              <span className="font-medium">{`${profile?.registrationType} No:`}</span>{" "}
              {profile?.registrationNo}
            </p> : null}
          {profile?.gstIn ? <p>
              <span className="font-medium">GSTIN:</span> {profile?.gstIn}
            </p> : null}
        </div>
      </div>
    </div>
  );
}
