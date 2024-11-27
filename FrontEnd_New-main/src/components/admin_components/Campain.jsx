import React from 'react';

const CampaignComponent = () => {
    const campaigns = [
        { id: 1, title: 'Campaign 1', description: 'Description for Campaign 1' },
        { id: 2, title: 'Campaign 2', description: 'Description for Campaign 2' },
        { id: 3, title: 'Campaign 3', description: 'Description for Campaign 3' },
        // Add more campaign data as needed
    ];

    return (
        <div>
            <h2>Campaigns for Patients</h2>
            <ul>
                {campaigns.map(campaign => (
                    <li key={campaign.id}>
                        <h3>{campaign.title}</h3>
                        <p>{campaign.description}</p>
                        {/* Additional campaign details */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CampaignComponent;
