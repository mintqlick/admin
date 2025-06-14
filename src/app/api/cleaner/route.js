// import { NextResponse } from "next/server";
// import { createClient } from "@/utils/supabase/client";

// export async function GET(request) {
//   // check for unmatched and untouched merge giver
//   const supabase = createClient();

//   //   delete unmatched contribution after 24hrs
//   const { error } = await supabase
//     .from("merge_givers")
//     .delete()
//     .lt("expires_at", new Date())
//     .eq("status", "waiting")
//     .eq("confirmed", false);

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 400 });
//   }

//   //   if receiver is unable to get money let hin enter que again
//   const { error: receiverQueError } = await supabase
//     .from("merge_receivers")
//     .update({
//       expires_at: new Date(),
//     })
//     .eq("matched", false)
//     .eq("confirmed", false)
//     .lt("expires_at", new Date())
//     .eq("status", "waiting");

//   if (receiverQueError) {
//     return NextResponse.json(
//       { error: receiverQueError.message },
//       { status: 400 }
//     );
//   }

//   //   if receiver or giver is matched
//   const { data, error: mergeGiverError } = await supabase
//     .from("merge_matches")
//     .select("*")
//     .eq("matched", true)
//     .lt("expires_in", new Date())
//     .neq("status", "completed");

//   if (mergeGiverError) {
//     return NextResponse.json(
//       { error: mergeGiverError.message },
//       { status: 400 }
//     );
//   }

//   //   split into 2 parts, the one with image_url and without image_url

//   const withImageUrl = data.filter((el) => el.image_url !== null);

//   const withOutImageUrl = data.filter(
//     (el) => el.image_url === null || !el.image_url
//   );

//   withImageUrl.forEach(async (matches) => {
//     // update the matches expires In
//     const { error: mthErr } = await supabase
//       .from("merge_matches")
//       .update("expires_in", new Date())
//       .eq("id", matches.id);

//     if (mthErr) {
//       return NextResponse.json({ error: mthErr.message }, { status: 400 });
//     }
//   });

//   withOutImageUrl.forEach(async (matches) => {
//     const { receiver_id, giver_id, matched_amount } = matches;

//     // get the amount remaining from the transaction
//     const {
//       data: { amount_remaining },
//       error: merge_errorVal,
//     } = await supabase
//       .from("merge_receivers")
//       .select("*")
//       .eq("id", receiver_id);

//     if (merge_errorVal) {
//       return NextResponse.json(
//         { error: merge_errorVal.message },
//         { status: 400 }
//       );
//     }

//     // update the user data
//     const { error: receiver_update_error } = await supabase
//       .from("merge_receivers")
//       .update({
//         amount_remaining: amount_remaining + matched_amount,
//         matched: false,
//         confirmed: false,
//         status: "waiting",
//       })
//       .eq("id", receiver_id);

//     if (receiver_update_error) {
//       return NextResponse.json(
//         { error: receiver_update_error.message },
//         { status: 400 }
//       );
//     }

//     const {
//       data: { amount_remaining: giver_amount_remaining },
//       error: giver_err,
//     } = await supabase.from("merge_givers").select("*").eq("id", giver_id);

//     if (giver_err) {
//       return NextResponse.json({ error: giver_err.message }, { status: 400 });
//     }

//     const { error: receiver_update_error_val } = await supabase
//       .from("merge_givers")
//       .update({
//         amount_remaining: giver_amount_remaining + matched_amount,
//         matched: false,
//         confirmed: false,
//         status: "waiting",
//       })
//       .eq("id", giver_id);

//     if (receiver_update_error_val) {
//       return NextResponse.json(
//         { error: receiver_update_error_val.message },
//         { status: 400 }
//       );
//     }

//     const { error: deletionErr } = await supabase
//       .from("merge_matches")
//       .delete()
//       .eq("id", matches.id);

//     if (deletionErr) {
//       return NextResponse.json({ error: deletionErr.message }, { status: 400 });
//     }
//   });
//   return NextResponse.json({ message: "Cleanup completed successfully." });
// }

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function GET(request) {
  const supabase = createClient();
  const now = new Date();
  const twentyFourHoursLater = new Date(
    now.getTime() + 24 * 60 * 60 * 1000
  ).toISOString();

  // 1. Delete unmatched contributions after 24hrs
  const { data: dltedRes, error: deleteError } = await supabase
    .from("merge_givers")
    .delete()
    .lt("expires_at", now.toISOString())
    .eq("status", "waiting")
    .eq("confirmed", false)
    .select("*");

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  // block user that did this
  for (const users of dltedRes) {
    await supabase
      .from("users")
      .update({ blocked: true })
      .eq("id", users.user_id);
  }

  // check if the person has been confirmed and then set the time to restart

  const { data: updatedRows, error: updateError } = await supabase
    .from("merge_givers")
    .update({ expires_at: twentyFourHoursLater })
    .match({ confirmed: true, matched: false })
    .lt("expires_at", now.toISOString());

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  // 2. Re-enter unmatched receivers to queue with new expiry time
  const { error: receiverQueError } = await supabase
    .from("merge_receivers")
    .update({ expires_at: twentyFourHoursLater })
    .eq("matched", false)
    .eq("confirmed", false)
    .lt("expires_at", now.toISOString())
    .eq("status", "waiting");

  if (receiverQueError) {
    return NextResponse.json(
      { error: receiverQueError.message },
      { status: 400 }
    );
  }

  // 3. Get expired, matched records that are not completed
  const { data: matches, error: matchError } = await supabase
    .from("merge_matches")
    .select("*")
    .lt("expires_in", now.toISOString())
    .neq("status", "completed");

  if (matchError) {
    console.log("match", matchError.message);
    return NextResponse.json({ error: matchError.message }, { status: 400 });
  }

  const withImageUrl = matches.filter((el) => el.image_url);
  const withoutImageUrl = matches.filter((el) => !el.image_url);

  // 4. Extend expiry for matches with image_url
  for (const match of withImageUrl) {
    const { error: updateErr } = await supabase
      .from("merge_matches")
      .update({ expires_in: twentyFourHoursLater })
      .eq("id", match.id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }
  }

  // 5. For matches without image_url, revert the match
  for (const match of withoutImageUrl) {
    const { receiver_id, giver_id, matched_amount } = match;

    // a. Fetch receiver
    const { data: receiverData, error: receiverErr } = await supabase
      .from("merge_receivers")
      .select("*")
      .eq("id", receiver_id)
      .single();

    if (receiverErr || !receiverData) {
      return NextResponse.json(
        { error: receiverErr?.message || "Receiver not found" },
        { status: 400 }
      );
    }

    // b. Update receiver
    const { error: receiverUpdateErr } = await supabase
      .from("merge_receivers")
      .update({
        amount_remaining: receiverData.amount_remaining + matched_amount,
        matched: false,
        confirmed: false,
        status: "waiting",
        expires_at: twentyFourHoursLater,
      })
      .eq("id", receiver_id);

    if (receiverUpdateErr) {
      return NextResponse.json(
        { error: receiverUpdateErr.message },
        { status: 400 }
      );
    }

    // c. Fetch giver
    const { data: giverData, error: giverErr } = await supabase
      .from("merge_givers")
      .select("*")
      .eq("id", giver_id)
      .single();

    if (giverErr || !giverData) {
      return NextResponse.json(
        { error: giverErr?.message || "Giver not found" },
        { status: 400 }
      );
    }

    // d. Update giver
    const { error: giverUpdateErr } = await supabase
      .from("merge_givers")
      .update({
        amount_remaining: giverData.amount_remaining + matched_amount,
        matched: false,
        confirmed: false,
        status: "waiting",
        expires_at: twentyFourHoursLater,
      })
      .eq("id", giver_id);

    if (giverUpdateErr) {
      return NextResponse.json(
        { error: giverUpdateErr.message },
        { status: 400 }
      );
    }

    // block the giver user
    const { error: giverUpdateBlockErr } = await supabase
      .from("users")
      .update({
        blocked: true,
      })
      .eq("user_id", giverData.user_id);

    if (giverUpdateBlockErr) {
      return NextResponse.json(
        { error: giverUpdateBlockErr.message },
        { status: 400 }
      );
    }

    // e. Delete match
    const { error: deleteMatchErr } = await supabase
      .from("merge_matches")
      .delete()
      .eq("id", match.id);

    if (deleteMatchErr) {
      return NextResponse.json(
        { error: deleteMatchErr.message },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ message: "Cleanup completed successfully." });
}
