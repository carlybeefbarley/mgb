import React from 'react'
import { Container, Header } from 'semantic-ui-react'
import Footer from '/client/imports/components/Footer/Footer'

const lastUpdateDate = 'May 3rd, 2017'

const TosUrl = '/legal/tos'

const thisSiteUrl = 'MyGameBuilder.com'
const thisSiteName = 'MyGameBuilder'
const thisSiteName_Site = `${thisSiteName} Site`

const ageMinimumToUse = 13

const assetTerm = 'Asset'
const companyName = 'MyCodeBuilder'

// Unsure why, but SUIR Table wasn't working so...
const Table = props => <table className="ui two column celled table">{props.children}</table>
Table.Header = props => <thead>{props.children}</thead>
Table.HeaderCell = props => <th>{props.children}</th>
Table.HeaderCellL = props => <th className="ten wide">{props.children}</th>
Table.HeaderCellR = props => <th className="six wide">{props.children}</th>
Table.Row = props => <tr>{props.children}</tr>
Table.Body = props => <tbody>{props.children}</tbody>
Table.Data = props => <td>{props.children}</td>

const LegalTableHeader = () => (
  <Table.Header>
    <Table.Row>
      <Table.HeaderCellL>Official legally binding terms</Table.HeaderCellL>
      <Table.HeaderCellR>
        Summary <small>(not legal advice)</small>
      </Table.HeaderCellR>
    </Table.Row>
  </Table.Header>
)

const LegalSection = props => (
  <div>
    <Header as="h3" content={props.banner} style={{ marginTop: '2em' }} />
    {props.extraText && <p>{props.extraText}</p>}
    <Table>
      <LegalTableHeader />
      <Table.Body>{props.children}</Table.Body>
    </Table>
  </div>
)

const Privacy = () => (
  <div>
    <Container>
      <LegalSection banner="Privacy Policy">
        <Table.Row>
          <Table.Data>
            {companyName} (“we,” “us” or “{companyName}”) provides services to users (“you” or the “user”)
            subject to this Privacy Policy (the “Privacy Policy”). The Privacy Policy applies to all services
            offered by the Company on its website, {thisSiteUrl} (the “{thisSiteName_Site}”), and all
            associated sites linked to the thisSiteName_Site by the Company, its subsidiaries and affiliates,
            including Company sites around the world (collectively, the “Company Services”). Defined terms
            used and not defined in this Privacy Policy are as set forth on the {thisSiteName}
            Terms of Service. The Company Services are the property of Company and its licensors.
          </Table.Data>
          <Table.Data>
            This document goes hand in hand with our <a href={TosUrl}>Terms of Service</a> which you should
            also read.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="What We Collect">
        <Table.Row>
          <Table.Data>
            We collect information on our users in various ways, such as, by your voluntary submissions,
            participation in the Company Services, from third parties, and through cookie and other tracking
            technology. We may collect the following information: 1) information that tells us specifically
            who you are, such as your name, phone number, email, postal address, and possibly information
            relating to certain support or customer service issues; 2) the Content, which includes the code,
            information, text, graphics, or other materials you submit through the Company Services; 3)
            general, non-personal, statistical information about the use of the Company Services, such as how
            many visitors visit a specific page, how long they stay on that page, and which hyperlinks, if
            any, they click on; 4) third party information; 5) cookies and other tracking technologies.
          </Table.Data>
          <Table.Data>
            Any information we have about you, you specifically supplied. We also track anonymous analytics
            information via Google Analytics as well as our own systems.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="How We Use Your Information">
        <Table.Row>
          <Table.Data>
            We may use your information in a variety of ways, including: 1) for internal review; 2) to improve
            the Company website and Company Services; 3) to optimize third-party offers of products and/or
            services; 4) to verify the legitimacy of the Content; 5) to notify you about updates to the
            Company website and Company Services; 6) to let you know about products, services, and promotions
            that you may be interested in; 7) for our marketing purposes; 8) to fulfill and provide products
            and services, including personalized or enhanced services, requested by you; and 9) internal
            business analysis or other business purposes consistent with our mission.
            <p>
              We may use third parties to assist us in processing your personal information, and we require
              that such third parties comply with our Privacy Policy and any other appropriate confidentiality
              and security measures. We may make your identifiable information, information you provided that
              is associated with your Company account (the “Account”) and the Content available to our
              employees and third parties with whom we contract for use to handle your Account. In addition,
              we may provide anonymous information about you to advertisers, service providers and other third
              parties.
            </p>
            <p>
              We may use certain other information collected from you to help diagnose technical problems,
              administer the {thisSiteName_Site}, and improve the quality and types of services delivered. We
              may provide non-identifying and aggregate usage and volume statistical information derived from
              the actions of our visitors and Account holders to third parties in order to demonstrate the
              value we deliver to users.
            </p>
            <p>
              The personal information we collect is NOT shared with or sold to other organizations for
              commercial purposes, except to provide products or services you’ve requested, when we have your
              permission, or under the following circumstances:
            </p>
            <ul>
              <li>
                if required to do so by law or if in good faith, the Company believes that such access,
                preservation or disclosure is reasonably necessary to: 1) comply with any legal process,
                including but not limited to an enforceable court order or lawful third party subpoena; 2)
                enforce this Privacy Policy; 3) respond to claims that any Content violates the rights of
                third parties; or 4) protect the rights, property or personal safety of the Company, its users
                and/or the public; or
              </li>
              <li>
                if {companyName} is acquired by or merged with another company. In this event,
                {companyName} will notify you before information about you is transferred and becomes subject
                to a different privacy policy.
              </li>
            </ul>
          </Table.Data>
          <Table.Data>
            <p>
              We might use the analytics data to figure out how to make the site better. We don't currently,
              but it's possible we might serve contextual ads based on that data. We may show potential
              advertisers anonymous aggregate data (e.g. pageviews). We may use an {assetTerm} you have
              created to help us troubleshoot the site.
            </p>
            <p>
              <strong>Your information is never shared or sold to anybody</strong>&ensp; unless we are
              required to by law
            </p>
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Security">
        <Table.Row>
          <Table.Data>
            <p>
              {companyName} has implemented processes intended to protect user information and maintain
              security of data. Each Account holder is assigned a unique user name and password, which is
              required to access their Account. It is each user’s responsibility to protect the security of
              his or her login information. We have attempted to protect {companyName}'s' servers by locating
              in them areas with security procedures, use of firewalls and implementing other generally
              available security technologies.
            </p>
            <p>
              These safeguards help prevent unauthorized access, maintain data accuracy, and ensure the
              appropriate use of data, but NO GUARANTEE CAN BE MADE THAT YOUR INFORMATION AND DATA WILL BE
              SECURE FROM INTRUSIONS AND UNAUTHORIZED RELEASE TO THIRD PARTIES.
            </p>
          </Table.Data>
          <Table.Data>
            You have a login and password to get into {thisSiteName}. You have a responsibility to protect
            that. We store that information. We also have a responsibility to protect that and will do our
            absolute best to do so. Unfortunately there are naughty people out there and we can't guarantee
            there will never be a data breach.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Third Party Websites and Links">
        <Table.Row>
          <Table.Data>
            You may have cookies placed on your computer by third party websites that refer you to the Company
            website and Company Services. Although we do not share your personal information with these third
            party websites unless you have authorized us to do so, they may be able to link certain
            non-personally identifiable information we transfer to them with personal information they
            previously collected from you. Please review the privacy policies of each website you visit to
            better understand their privacy practices. In addition, the Company would like to inform you that
            anytime you click on links (including advertising banners), which take you to third party
            websites, you will be subject to the third parties' privacy policies. While we support the
            protection of our customer's privacy on the Internet, the Company expressly disclaims any and all
            liability for the actions of third parties, including but without limitation to actions relating
            to the use and/or disclosure of personal information by third parties.
          </Table.Data>
          <Table.Data>
            <p>
              We may use cookies but we never store any personal information in cookies. If you see weirdly
              personal information on other sites, it's not from us.
            </p>
            <p>When you are on other sites, you're subject to their policies, not ours.</p>
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Cancellation or Termination of Your Account">
        <Table.Row>
          <Table.Data>
            If you choose to cancel your Account and leave the Company Services or your Account is terminated
            because of your breach of the Terms of Service, please be aware that the Company may for a time
            retain residual information in our backup and/or archival copies of our database.
          </Table.Data>
          <Table.Data>
            If you (or we) delete your account, it will be immediately gone from the public view of the
            website, but some of your data may still be in our backups. That data will also be deleted when
            our backups eventually expire.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Compliance with Children’s Online Privacy Protection Act">
        <Table.Row>
          <Table.Data>
            {companyName} does NOT target its offerings toward, and does not knowingly collect any personal
            information from users under {ageMinimumToUse} years of age.
          </Table.Data>
          <Table.Data>
            It's against our Terms of Service for anyone under {ageMinimumToUse} to sign up.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Accessing and Updating Personal Information">
        <Table.Row>
          <Table.Data>
            When you use the {thisSiteName_Site}, we make good faith efforts to provide you with access to
            your personal information and either to correct this data if it is inaccurate or to delete such
            data at your request if it is not otherwise required to be retained by law or for legitimate
            business purposes. You may update your Account information by logging into your Account. When
            requests come to {companyName} with regard to personal information, we ask individual users to
            identify themselves and the information requested to be accessed, corrected or removed before
            processing such requests, and we may decline to process requests that are unreasonably repetitive
            or systematic, require disproportionate technical effort, jeopardize the privacy of others, or
            would be extremely impractical (for instance, requests concerning information residing on backup
            tapes), or for which access is not otherwise required. In any case where we provide information
            access and correction, we perform this service free of charge, except if doing so would require a
            disproportionate effort.
          </Table.Data>
          <Table.Data>
            You can change or delete all your personal information on {thisSiteName} from {thisSiteName}
            itself. We won't change personal information via email request (it's not secure) and we won't
            change personal information in our backups (it's not practical to do so).
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Changes to this Policy">
        <Table.Row>
          <Table.Data>
            {companyName} may periodically update this policy. We will notify you about significant changes in
            the way we treat personal information by posting a prominent notice on the {thisSiteName_Site}.
            Each version of this Policy will be identified at the bottom of the page by its effective date.
          </Table.Data>
          <Table.Data>
            If we change anything of real significance in this policy, we'll notify you via the in-app
            notification or "What's New" systems.
          </Table.Data>
        </Table.Row>
      </LegalSection>
      <br />
      <p>This privacy policy was last updated at {lastUpdateDate}</p>
    </Container>
    <Footer />
  </div>
)

export default Privacy
