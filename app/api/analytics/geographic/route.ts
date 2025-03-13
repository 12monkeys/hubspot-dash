import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { createHubSpotClient } from "../../../lib/hubspot";
import { Contact } from "../../../types/hubspot";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const hubspot = createHubSpotClient();
    
    // Get contacts data
    const contactsResponse = await hubspot.apiRequest({
      path: '/crm/v3/objects/contacts',
      qs: {
        properties: 'region,tipo_contacto',
        limit: 100
      }
    });
    
    const contacts = await contactsResponse.json();
    const contactsList = contacts.results as Contact[];
    
    // Calculate regional distribution
    const regionMap = new Map<string, {
      count: number;
      growth: number;
      conversionRate: number;
    }>();
    
    // Get previous period data for growth calculation
    const previousPeriod = new Date();
    previousPeriod.setMonth(previousPeriod.getMonth() - 1);
    
    const previousContactsResponse = await hubspot.apiRequest({
      path: '/crm/v3/objects/contacts',
      qs: {
        properties: 'region,tipo_contacto',
        limit: 100,
        createdBefore: previousPeriod.toISOString()
      }
    });
    
    const previousContacts = await previousContactsResponse.json();
    const previousContactsList = previousContacts.results as Contact[];
    
    // Process current contacts
    contactsList.forEach((contact: Contact) => {
      const region = contact.properties.region || "Sin región";
      const current = regionMap.get(region) || {
        count: 0,
        growth: 0,
        conversionRate: 0,
      };
      
      current.count++;
      regionMap.set(region, current);
    });
    
    // Calculate growth and conversion rates
    const totalContacts = contactsList.length;
    const previousTotal = previousContactsList.length;
    
    regionMap.forEach((data, region) => {
      const previousCount = previousContactsList.filter(
        (c: Contact) => (c.properties.region || "Sin región") === region
      ).length;
      
      // Calculate growth rate
      data.growth = previousCount === 0 ? 0 :
        ((data.count - previousCount) / previousCount) * 100;
      
      // Calculate conversion rate (using tipo_contacto as conversion indicator)
      const conversions = contactsList.filter(
        (c: Contact) => (c.properties.region || "Sin región") === region &&
        c.properties.tipo_contacto === "Afiliado"
      ).length;
      
      data.conversionRate = data.count === 0 ? 0 : conversions / data.count;
    });
    
    // Convert to array and sort by count
    const distribution = Array.from(regionMap.entries())
      .map(([region, data]) => ({
        region,
        count: data.count,
        growth: data.growth,
        conversionRate: data.conversionRate,
        percentage: data.count / totalContacts,
      }))
      .sort((a, b) => b.count - a.count);
    
    return NextResponse.json({ data: distribution });
    
  } catch (error) {
    console.error("Error fetching geographic distribution:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 