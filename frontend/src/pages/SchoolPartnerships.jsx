import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Users, Search, CheckCircle, Clock, XCircle, Plus,
  School, Handshake, Loader2, BookOpen, FileText, GraduationCap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SchoolPartnerships() {
  const [user, setUser] = useState(null);
  const [mySchool, setMySchool] = useState(null);
  const [partnerships, setPartnerships] = useState([]);
  const [allSchools, setAllSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(null);
  const [respondingTo, setRespondingTo] = useState(null);
  const [shareSettings, setShareSettings] = useState({
    share_notes: true,
    share_assignments: true,
    share_past_papers: true
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Find school this user admins
      const schools = await base44.entities.School.filter({ admin_user_id: userData.id });
      if (schools.length === 0) {
        setLoading(false);
        return;
      }
      const school = schools[0];
      setMySchool(school);

      const [sent, received, schoolsList] = await Promise.all([
        base44.entities.SchoolPartnership.filter({ requesting_school_id: school.id }),
        base44.entities.SchoolPartnership.filter({ partner_school_id: school.id }),
        base44.entities.School.filter({ is_verified: true }, 'name', 50)
      ]);

      setPartnerships([...sent, ...received]);
      setAllSchools(schoolsList.filter(s => s.id !== school.id));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPartnershipStatus = (schoolId) => {
    return partnerships.find(
      p =>
        (p.requesting_school_id === mySchool?.id && p.partner_school_id === schoolId) ||
        (p.partner_school_id === mySchool?.id && p.requesting_school_id === schoolId)
    );
  };

  const sendPartnerRequest = async (partnerSchool) => {
    setSendingRequest(partnerSchool.id);
    try {
      await base44.entities.SchoolPartnership.create({
        requesting_school_id: mySchool.id,
        requesting_school_name: mySchool.name,
        partner_school_id: partnerSchool.id,
        partner_school_name: partnerSchool.name,
        status: 'pending',
        ...shareSettings
      });
      toast.success(`Partnership request sent to ${partnerSchool.name}`);
      loadData();
    } catch (error) {
      toast.error('Failed to send request');
    } finally {
      setSendingRequest(null);
    }
  };

  const respondToRequest = async (partnership, accept) => {
    setRespondingTo(partnership.id);
    try {
      await base44.entities.SchoolPartnership.update(partnership.id, {
        status: accept ? 'approved' : 'rejected',
        approved_at: accept ? new Date().toISOString() : undefined
      });
      toast.success(accept ? 'Partnership approved!' : 'Partnership rejected');
      loadData();
    } catch (error) {
      toast.error('Failed to respond');
    } finally {
      setRespondingTo(null);
    }
  };

  const activePartnerships = partnerships.filter(p => p.status === 'approved');
  const pendingReceived = partnerships.filter(
    p => p.status === 'pending' && p.partner_school_id === mySchool?.id
  );
  const pendingSent = partnerships.filter(
    p => p.status === 'pending' && p.requesting_school_id === mySchool?.id
  );

  const filteredSchools = allSchools.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.county?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!mySchool) {
    return (
      <div className="p-8 text-center">
        <Handshake className="h-16 w-16 mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">School Admin Required</h2>
        <p className="text-slate-500">Only school administrators can manage partnerships.</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Handshake className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">School Partnerships</h1>
            <p className="text-slate-500">Connect with other schools to share curated learning materials</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border-slate-200 text-center p-4">
          <p className="text-3xl font-bold text-violet-600">{activePartnerships.length}</p>
          <p className="text-sm text-slate-500 mt-1">Active Partners</p>
        </Card>
        <Card className="border-slate-200 text-center p-4">
          <p className="text-3xl font-bold text-yellow-500">{pendingReceived.length}</p>
          <p className="text-sm text-slate-500 mt-1">Pending Requests</p>
        </Card>
        <Card className="border-slate-200 text-center p-4">
          <p className="text-3xl font-bold text-blue-600">{allSchools.length}</p>
          <p className="text-sm text-slate-500 mt-1">Schools Available</p>
        </Card>
      </div>

      <Tabs defaultValue="discover">
        <TabsList className="mb-6">
          <TabsTrigger value="discover">Discover Schools</TabsTrigger>
          <TabsTrigger value="partners">
            My Partners
            {activePartnerships.length > 0 && (
              <Badge className="ml-2 bg-violet-600">{activePartnerships.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {pendingReceived.length > 0 && (
              <Badge className="ml-2 bg-yellow-500">{pendingReceived.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Discover */}
        <TabsContent value="discover">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search schools by name or county..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Share Settings for new requests */}
            <Card className="border-violet-200 bg-violet-50">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-violet-800 mb-3">Default sharing permissions for new partnerships:</p>
                <div className="flex flex-wrap gap-6">
                  {[
                    { key: 'share_notes', label: 'Notes', icon: BookOpen },
                    { key: 'share_assignments', label: 'Assignments', icon: GraduationCap },
                    { key: 'share_past_papers', label: 'Past Papers', icon: FileText }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Switch
                        checked={shareSettings[key]}
                        onCheckedChange={(v) => setShareSettings(prev => ({ ...prev, [key]: v }))}
                      />
                      <Icon className="h-4 w-4 text-violet-600" />
                      <Label className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchools.map(school => {
                const existingPartnership = getPartnershipStatus(school.id);
                return (
                  <motion.div
                    key={school.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-slate-200 hover:border-violet-300 transition-all h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <School className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">{school.name}</h3>
                            <p className="text-sm text-slate-500">{school.county} • {school.level?.replace('_', ' ')}</p>
                          </div>
                        </div>

                        {existingPartnership ? (
                          <Badge
                            className={`w-full justify-center ${
                              existingPartnership.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : existingPartnership.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {existingPartnership.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {existingPartnership.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {existingPartnership.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                            {existingPartnership.status === 'approved' ? 'Partners' : 
                             existingPartnership.status === 'rejected' ? 'Declined' : 'Request Sent'}
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full bg-violet-600 hover:bg-violet-700"
                            onClick={() => sendPartnerRequest(school)}
                            disabled={sendingRequest === school.id}
                          >
                            {sendingRequest === school.id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Plus className="h-3 w-3 mr-1" />
                            )}
                            Request Partnership
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {filteredSchools.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <School className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No schools found matching your search</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* My Partners */}
        <TabsContent value="partners">
          {activePartnerships.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Handshake className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No active partnerships yet. Discover schools to connect with!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePartnerships.map(p => {
                const isRequester = p.requesting_school_id === mySchool.id;
                const partnerName = isRequester ? p.partner_school_name : p.requesting_school_name;
                return (
                  <Card key={p.id} className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <School className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{partnerName}</h3>
                          <p className="text-xs text-slate-500">
                            Since {new Date(p.approved_at || p.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {p.share_notes && <Badge variant="outline" className="text-xs"><BookOpen className="h-2.5 w-2.5 mr-1" />Notes</Badge>}
                        {p.share_assignments && <Badge variant="outline" className="text-xs"><GraduationCap className="h-2.5 w-2.5 mr-1" />Assignments</Badge>}
                        {p.share_past_papers && <Badge variant="outline" className="text-xs"><FileText className="h-2.5 w-2.5 mr-1" />Past Papers</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Requests */}
        <TabsContent value="requests">
          <div className="space-y-6">
            {pendingReceived.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                  Incoming Requests ({pendingReceived.length})
                </h3>
                <div className="space-y-3">
                  {pendingReceived.map(p => (
                    <Card key={p.id} className="border-yellow-200 bg-yellow-50">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                            <School className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{p.requesting_school_name}</p>
                            <p className="text-xs text-slate-500">Wants to partner with your school</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => respondToRequest(p, true)}
                            disabled={respondingTo === p.id}
                          >
                            {respondingTo === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => respondToRequest(p, false)}
                            disabled={respondingTo === p.id}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pendingSent.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                  Sent Requests ({pendingSent.length})
                </h3>
                <div className="space-y-3">
                  {pendingSent.map(p => (
                    <Card key={p.id} className="border-slate-200">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-200 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium">{p.partner_school_name}</p>
                            <p className="text-xs text-slate-500">Awaiting response</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pendingReceived.length === 0 && pendingSent.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No pending requests</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}