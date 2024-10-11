import  multer from 'multer' ;
import  XLSX from 'xlsx';



//Importing files
import { sendEmail } from '../utils/sendEmail.js';
import query from '../database/query.js';
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";


export const vendorNotify = async (email_service, serviceData) => {
    try {
        const tableName = 'vendor_notify as vendor';
        const projection = 'vendor.*';
        const condition = `mail_flag=0`;
        const vendorData = await query.getObjectByConditions(tableName, projection, condition, undefined, undefined, undefined)
        if (vendorData?.success == false || vendorData?.data?.length == 0) {
            // return next(new ErrorHandler('No Data Found!', 400))
            return {success:false, message: 'No Data Found!'}
        } else {
            const vendorIds = vendorData?.data.map(item => item.id);
            console.log(vendorIds)
            const tableName2 = 'item_notify as item';
            const condition2 = `vendor_id IN(${vendorIds})`;
            var itemData = await query.getObjectByConditions(tableName2, undefined, condition2, undefined, undefined, undefined);
            console.log(itemData);

            const mergedData = vendorData?.data?.map(vendor => {
                const data = itemData?.data?.filter(item => item.vendor_id === vendor.id);
                return {
                    ...vendor,
                    items: data
                };
            });

            for (const user of mergedData) {
                let tableRows = '';
                user.items.forEach((row, index) => {
                    tableRows += `<tr>
                                    <td>${index + 1}</td>
                                    <td>${user.vendor_code}</td>
                                    <td>${row.item_code}</td>
                                    <td>${row.item_name}</td>
                                    <td>${row.demand_count}</td>
                                    <td>${row.remarks}</td>
                                 </tr>`;
                });

                const campaignData = {}
                campaignData.subject = 'Revolt Testing'
                campaignData.email_template = `<p>Dear ${user.vendor_name},</p>
                            <p>I hope this email finds you well.</p>
                            <p>I am writing to follow up on the pending delivery of the below Material as per the agreed timeline. It is crucial for us to receive the full quantity on time in order to meet our production schedules and ensure smooth operations.</p>
                            <table border="1" cellpadding="5" cellspacing="0">
                            <thead>
                                <tr>
                                <th>Sn</th>
                                <th>Vendor Code</th>
                                <th>Item Code</th>
                                <th>Item Name</th>
                                <th>Demand Count</th>
                                <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                            </table>
                            <p>Kindly provide an update on the expected delivery date of the remaining quantity, and please ensure that the shipment adheres to the original delivery commitment.</p>
                            <p>We value your partnership and trust that you will prioritize this matter to avoid any disruption.</p>
                            <p>Looking forward to your prompt response.</p>
                            <p>Best regards,<br>Revolt Motors</p>
                            `; 
                const sentMail = await sendEmail(user.vendor_email, email_service, serviceData, campaignData );
                console.log("sentMail", sentMail);
                if (!sentMail.accepted && sentMail.rejected.length > 0) {
                    continue
                } else {
                    const dataToupdate = {
                        mail_flag: 1
                    }
                    const updatedData = await query.updateMultipleObjectByCondition('vendor_notify', `id='${user.id}'`, dataToupdate);
                }
            }
            // return
            return {success: true, message: 'Email sent succefully'}
        }
    } catch (error) {
        return {success: false, message:error?.message};
    }
};




export const sendingMail = catchAsyncErrors(async (req, res, next) => {
    try {
        const { campaign_name, email_service } = req.body;
        console.log(req.file);
        const fetchEmailService = await query.getObjectByConditions('mail_services', undefined, `service='${email_service}'`, undefined, undefined, undefined);
        if (!fetchEmailService?.data?.length) {
            return next(new ErrorHandler('No Email Services', 400));
        }
        else if(!req.file && campaign_name === 'vendor_notify'){
            const result = await vendorNotify(email_service, fetchEmailService?.data[0]);
            res.status(200).json({
                success: result.success,
                message: result.message
            });
        }
        else {
            const fetchCampaignData = await query.getObjectByConditions('campaign_template', undefined, `campaign_name = '${campaign_name}'`, undefined, undefined, undefined);
            if (!fetchCampaignData?.data?.length) {
                return next(new ErrorHandler('No Campaign Data', 400));
            }
            else{
                const fileBuffer = req.file.buffer;
                const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);
                const emailList = data.map(row => row.Email);

            for (const email of emailList) {
                const sentEmail = await sendEmail(email, email_service, fetchEmailService?.data[0], fetchCampaignData?.data[0])
                console.log("sentMail", sentEmail);
                var insertedData;
                if (!sentEmail.accepted && sentEmail.rejected.length > 0) {
                    insertedData = {
                        campaign_template_id:fetchCampaignData?.data[0].id,
                        mail_service_id: fetchEmailService?.data[0].id,
                        to_email:email,
                        mail_flag: 0
                    }
                } else {
                    insertedData = {
                        campaign_template_id:fetchCampaignData?.data[0].id,
                        mail_service_id: fetchEmailService?.data[0].id,
                        to_email:email,
                        mail_flag: 1
                    } 
                }
                const updatedData = await query.createObject('vendor_notify_logs', insertedData);
            }
            res.status(200).json({
                success: true,
                message: 'Mail have been sent!'
            })
            }     

        }
    } catch (error) {
        next(error)
    }
})