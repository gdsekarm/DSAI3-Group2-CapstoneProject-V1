# AWS Deployment Guide: AI Resume Matcher

This guide details the steps to deploy your Python FastAPI & Vanilla HTML application to AWS so it can be accessed publicly via a web link.

Since your application uses Python, FastAPI, and serves static files seamlessly, the easiest and most modern way to deploy this without managing underlying servers is **AWS App Runner** or **AWS Elastic Beanstalk**. 

This guide uses **AWS Elastic Beanstalk**, as it perfectly handles standard Python web servers out-of-the-box.

---

## Prerequisites
1. **An AWS Account**: You must have an active AWS account.
2. **AWS CLI & EB CLI**: Installed on your Mac.
   - Install AWS CLI: Download from AWS or use Homebrew (`brew install awscli`)
   - Install EB CLI (Elastic Beanstalk CLI): `pip install awsebcli`
3. **Your Gemini API Key**: Ready to be added as a secure environment variable.

---

## Step 1: Prepare the Project for AWS

AWS Elastic Beanstalk automatically looks for a file named `application.py` or a specific command to run your server. We need to make a tiny adjustment so AWS knows how to run FastAPI.

1. **Create a `Procfile`**:
   In your root project folder (`/Users/govindandhanasekaran/Dev/AntiGravity/Capstone-SGJob`), create a file exactly named `Procfile` (no extension) and add the following line:
   ```text
   web: uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   *This tells AWS exactly what command to run to launch your server on the public port.*

2. **Ensure `requirements.txt` is updated**:
   Double-check that all your packages (fastapi, uvicorn, google-genai, etc.) are in the `requirements.txt` file. You can run:
   ```bash
   pip freeze > requirements.txt
   ```

---

## Step 2: Zip Your Project

Instead of using the command line, we will upload the project as a `.zip` file to AWS.

1. Open **Finder** and navigate to your project folder (`Capstone-SGJob`).
2. Select **all the files and folders** *inside* the project folder (including `main.py`, `Procfile`, `requirements.txt`, `frontend/`, and `backend/`).
   * **CRITICAL**: Do **NOT** select or zip the `.venv` folder! AWS Linux cannot read Mac virtual environments. AWS will automatically install its own Python virtual environment using your `requirements.txt`.
   * *Do **not** zip the parent `Capstone-SGJob` folder itself. Zip the contents.*
3. Right-click the selected files and click **Compress**.
4. Rename the newly created archive to `resume-matcher-app.zip`.

---

## Step 3: Create the AWS Environment via the Web Console

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. Search for **Elastic Beanstalk** in the top search bar and click it.
3. Click the orange **Create application** button.
4. **Environment tier**: Leave it as "Web server environment".
5. **Application Information**:
   - Application name: `ai-resume-matcher`
6. **Platform**:
   - Platform: Choose **Python**.
   - Platform branch: Choose the latest **Python 3.9** (or whichever matches your local environment).
7. **Application Code**:
   - Select **Upload your code**.
   - Choose **Local file** -> **Choose file** and upload your `resume-matcher-app.zip`.
8. Scroll down and click **Next**.
9. **Service Access**: If you don't have an existing service role, choose "Create and use new service role". If you need an EC2 instance profile, create one in IAM (it will prompt you if missing). Click **Skip to Review** if available, or just click **Next** through the other steps leaving default settings.
10. Click **Submit** on the final review page.

AWS will now take 3-5 minutes to spawn your server.

---

## Step 4: Add Your Gemini API Key Securely

Your `GEMINI_API_KEY` should never be hardcoded or included in your ZIP file. You add it securely through the AWS dashboard.

1. Once your environment finishes creating (you see a green checkmark), click on your environment name on the left sidebar.
2. Click **Configuration** in the left sidebar.
3. Scroll down to the **Updates, monitoring, and routing** section and click **Edit**.
4. Scroll to the very bottom to the **Environment properties** section.
5. Add a new row:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyAqaa6...your_full_key...`
6. Click **Apply** at the bottom. AWS will quickly restart your app to inject the key.

---

## Step 5: Open Your Public Web Link!

Your application is now live on the internet!

On your Elastic Beanstalk Environment dashboard page, you will see a clickable URL under your environment name (e.g., `ai-resume-matcher-env.eba-xxxxxxx.us-east-1.elasticbeanstalk.com`). 

Click that link to open your live application. You can safely share this URL with anyone.

---

## Step 6: Troubleshooting & Debugging (If Deployment Fails)

If your environment shows a "Severe" or "Degraded" health status (red/yellow instead of green), or if your website returns a "502 Bad Gateway" error, you need to check the server logs to see what Python is complaining about.

### How to Retrieve Logs in AWS:
1. Go to your Elastic Beanstalk Environment dashboard.
2. In the left-hand sidebar, click on **Logs**.
3. In the top right corner, click the **Request logs** dropdown button.
4. Select **Last 100 lines** (this is usually enough for a quick debug) or "Full logs" if you want to download the entire history.
5. Wait a few seconds, then refresh the page or click **Download** on the new log file that appears in the list.

### Understanding the Logs:
When you open the log file, scroll all the way to the bottom. AWS bundles many log files together. You are specifically looking for the section titled `----------------------------------------`
`/var/log/web.stdout.log` (or `eb-engine.log`).

This section will contain the exact Python or AWS errors, such as:
* **Missing Module**: You forgot to include a library in `requirements.txt`.
* **Missing File**: You didn't zip a necessary file (like `main.py`).
* **Environment Variable Error**: You didn't set `GEMINI_API_KEY` correctly in the Configuration tab.
* **Bad Procfile**: Your `Procfile` has a typo or is missing the final newline character.

---

---

## Step 7: Securing Your Link with HTTPS (SSL Certificate)

By default, AWS provides an `http://` link. Modern mobile browsers (like Safari on iPhone) aggressively default to `https://`, which causes the site to look "broken" unless you manually edit the URL bar. 

To permanently secure your link and make it `https://`, you need to attach a free SSL certificate to your AWS Load Balancer.

1. **Get a Custom Domain Name**: AWS requires you to own a domain name (e.g., `myresumematcher.com`) to issue an SSL certificate. You can buy one for ~$10/year in **AWS Route 53**.
2. **Request a Free Certificate**: Go to **AWS Certificate Manager (ACM)** in the console and request a free public certificate for your new domain name (and `*.yourdomain.com`).
3. **Verify the Certificate**: AWS will ask you to add a DNS record to prove you own the domain. If you bought it in Route 53, click the "Create record in Route 53" button.
4. **Attach it to Elastic Beanstalk**:
   * Go back to your Elastic Beanstalk Environment -> **Configuration**.
   * Scroll down to **Load balancer** and click **Edit**.
   * Under the **Listeners** section, click **Add listener**.
   * Set Port to `443`, Protocol to `HTTPS`, and select the SSL Certificate you just created from the dropdown.
   * Click **Apply**.
5. **Update DNS**: Finally, go to Route 53 and point your custom domain name (using an "A Record" with an "Alias") to your Elastic Beanstalk environment URL.

Now your application will load securely via `https://yourdomain.com` on all devices automatically!

---

### Alternative: Vercel (Easiest Option outside AWS)
If you do not strictly require AWS, deploying a Python/FastAPI app is actually fastest on **Render** or **Vercel**. 
On those platforms, you simply link your GitHub repository, paste your `GEMINI_API_KEY` into their dashboard, and they give you a free SSL URL instantly without any command-line server configuration.
