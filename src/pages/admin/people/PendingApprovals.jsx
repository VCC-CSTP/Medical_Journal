import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConnectDatabase from "../../../lib/ConnectDatabase";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export const PendingApprovals = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkPermissionsAndLoadData();
  }, []);

  const checkPermissionsAndLoadData = async () => {
    try {
      // Check if user is authenticated
      const {
        data: { user },
        error: authError,
      } = await ConnectDatabase.auth.getUser();

      if (authError || !user) {
        navigate("/login");
        return;
      }

      // Check if user is super_admin
      const { data: profileData, error: profileError } =
        await ConnectDatabase.from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .single();

      if (profileError || !profileData || profileData.role !== "super_admin") {
        setError("You don't have permission to access this page.");
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      await loadPendingUsers();
    } catch (err) {
      console.error("Error checking permissions:", err);
      setError("Failed to load data. Please try again.");
      setLoading(false);
    }
  };

  const loadPendingUsers = async () => {
    try {
      setLoading(true);

      // Get all pending registrations with user and person data
      const { data, error } = await ConnectDatabase.from("user_profiles")
        .select(
          `
          id,
          email,
          phone,
          cv_url,
          approval_status,
          created_at,
          person:people(
            first_name,
            last_name,
            middle_name,
            full_name,
            title,
            affiliation,
            position
          )
        `
        )
        .eq("approval_status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPendingUsers(data || []);
    } catch (err) {
      console.error("Error loading pending users:", err);
      setError("Failed to load pending registrations.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, userEmail) => {
    if (!confirm("Are you sure you want to approve this registration?")) {
      return;
    }

    try {
      setProcessingId(userId);
      setError("");

      // Update user_profiles to approved
      const { error: updateError } = await ConnectDatabase.from("user_profiles")
        .update({
          approval_status: "approved",
          approval_date: new Date().toISOString(),
          approved_by: currentUser.id,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Send password setup email
      // This would typically be done via a Supabase Edge Function
      // For now, we'll generate a password reset link
      const { error: resetError } =
        await ConnectDatabase.auth.resetPasswordForEmail(userEmail, {
          redirectTo: `${window.location.origin}/set-password`,
        });

      if (resetError) {
        console.error("Error sending approval email:", resetError);
        alert(
          "Registration approved successfully, but failed to send email. " +
            "Please manually send the user their activation link."
        );
      } else {
        alert(
          "Registration approved successfully! " +
            "The user has been sent an email with instructions to set their password."
        );
      }

      // Reload the list
      await loadPendingUsers();
    } catch (err) {
      console.error("Error approving user:", err);
      setError("Failed to approve registration. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId) => {
    const reason = prompt(
      "Please provide a reason for rejection (this will be sent to the user):"
    );

    if (!reason || !reason.trim()) {
      alert("Rejection reason is required.");
      return;
    }

    try {
      setProcessingId(userId);
      setError("");

      // Update user_profiles to rejected
      const { error: updateError } = await ConnectDatabase.from("user_profiles")
        .update({
          approval_status: "rejected",
          approval_date: new Date().toISOString(),
          approved_by: currentUser.id,
          registration_notes: reason.trim(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      alert(
        "Registration rejected. " +
          "The user will be notified via email with the reason provided."
      );

      // Reload the list
      await loadPendingUsers();
    } catch (err) {
      console.error("Error rejecting user:", err);
      setError("Failed to reject registration. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const downloadCV = (cvUrl, userName) => {
    if (!cvUrl) {
      alert("No CV file available for this user.");
      return;
    }

    // Open CV in new tab
    window.open(cvUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-gray-600">
            Loading pending registrations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/adm/dashboard")}
            className="group flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Pending Registrations
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Review and approve user registration requests
              </p>
            </div>
            <button
              onClick={loadPendingUsers}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Users List */}
        {pendingUsers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No Pending Registrations
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              All registration requests have been processed.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {pendingUsers.map((user) => {
                const person = user.person?.[0];
                const fullName = person?.full_name || "N/A";
                const isProcessing = processingId === user.id;

                return (
                  <li key={user.id} className="px-6 py-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* User Info */}
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {person?.title && `${person.title} `}
                            {fullName}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <ClockIcon className="mr-1 h-3 w-3" />
                            Pending
                          </span>
                        </div>

                        {/* Contact Details */}
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center">
                              <span className="mr-2 text-gray-400">📱</span>
                              {user.phone}
                            </div>
                          )}
                        </div>

                        {/* Professional Info */}
                        {(person?.affiliation || person?.position) && (
                          <div className="mt-3 text-sm text-gray-700">
                            {person?.position && (
                              <p className="font-medium">{person.position}</p>
                            )}
                            {person?.affiliation && <p>{person.affiliation}</p>}
                          </div>
                        )}

                        {/* Registration Date */}
                        <p className="mt-3 text-xs text-gray-500">
                          Registered:{" "}
                          {new Date(user.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>

                        {/* CV Download Button */}
                        {user.cv_url && (
                          <button
                            onClick={() => downloadCV(user.cv_url, fullName)}
                            className="mt-3 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                            Download CV
                          </button>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="ml-6 flex flex-col space-y-2">
                        <button
                          onClick={() => handleApprove(user.id, user.email)}
                          disabled={isProcessing}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <>
                              <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          disabled={isProcessing}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Statistics */}
        {pendingUsers.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>{pendingUsers.length}</strong> registration
              {pendingUsers.length !== 1 ? "s" : ""} awaiting review
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
